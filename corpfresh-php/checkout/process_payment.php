<?php
// Configuración de encabezados
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Configuración de errores
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');
error_reporting(E_ALL);

// Función para respuestas JSON
function jsonResponse($success, $data = [], $error = '', $code = 200) {
    http_response_code($code);
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'error' => $error,
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// Manejar preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

// Registrar inicio
error_log("=== Inicio del proceso de pago ===");

// Obtener datos del POST
$json_input = file_get_contents('php://input');
error_log("Datos recibidos: " . $json_input);

// Verificar datos vacíos
if (empty($json_input)) {
    error_log("Error: No se recibieron datos");
    jsonResponse(false, [], 'No se recibieron datos', 400);
}

// Decodificar JSON
$data = json_decode($json_input);
if (json_last_error() !== JSON_ERROR_NONE) {
    error_log("Error JSON: " . json_last_error_msg());
    jsonResponse(false, [], 'Datos JSON inválidos: ' . json_last_error_msg(), 400);
}

// Validar campos requeridos
$required_fields = ['correo_usuario', 'items', 'total', 'metodo_pago', 'direccion', 'telefono', 'envio', 'impuestos'];
foreach ($required_fields as $field) {
    if (!isset($data->$field)) {
        error_log("Error: Falta campo requerido - $field");
        jsonResponse(false, [], "Falta el campo requerido: $field", 400);
    }
}

// Validar formato de email
if (!filter_var($data->correo_usuario, FILTER_VALIDATE_EMAIL)) {
    error_log("Error: Email inválido - " . $data->correo_usuario);
    jsonResponse(false, [], "El formato del correo electrónico no es válido", 400);
}

// Validar items del carrito
if (!is_array($data->items) || count($data->items) === 0) {
    error_log("Error: Carrito vacío");
    jsonResponse(false, [], "El carrito no contiene productos", 400);
}

// Validar valores numéricos
if (!is_numeric($data->total) || $data->total <= 0) {
    error_log("Error: Total inválido - " . $data->total);
    jsonResponse(false, [], "El total debe ser un número positivo", 400);
}

// Conexión a la base de datos
$host = 'localhost';
$dbname = 'corpfreshh';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->beginTransaction();

    error_log("Conexión a BD establecida");

    // 1. Insertar pedido
    $stmt = $conn->prepare("INSERT INTO pedidos (
        correo_usuario, 
        fecha_pedido, 
        total, 
        metodo_pago, 
        direccion_entrega, 
        telefono_contacto,
        costo_envio,
        impuestos,
        estado
    ) VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, 'pendiente')");

    $stmt->execute([
        $data->correo_usuario,
        $data->total,
        $data->metodo_pago,
        $data->direccion,
        $data->telefono,
        $data->envio,
        $data->impuestos
    ]);

    $pedido_id = $conn->lastInsertId();
    error_log("Pedido creado - ID: $pedido_id");

    // 2. Insertar items del pedido
    $stmt = $conn->prepare("INSERT INTO pedidos_detalle (
        pedido_id, 
        producto_id, 
        nombre_producto, 
        precio_unitario, 
        cantidad, 
        subtotal,
        color,
        talla
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

    foreach ($data->items as $item) {
        $subtotal = $item->precio * $item->cantidad;
        $stmt->execute([
            $pedido_id,
            $item->id_producto,
            $item->nombre,
            $item->precio,
            $item->cantidad,
            $subtotal,
            $item->color ?? null,
            $item->talla ?? null
        ]);
    }

    error_log("Items del pedido insertados");

    // 3. Generar factura
    $subtotal = $data->total - $data->envio - $data->impuestos;
    $stmt = $conn->prepare("INSERT INTO facturas (
        pedido_id,
        correo_usuario,
        fecha_factura,
        subtotal,
        envio,
        impuestos,
        total,
        metodo_pago
    ) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)");

    $stmt->execute([
        $pedido_id,
        $data->correo_usuario,
        $subtotal,
        $data->envio,
        $data->impuestos,
        $data->total,
        $data->metodo_pago
    ]);

    $factura_id = $conn->lastInsertId();
    error_log("Factura generada - ID: $factura_id");

    $conn->commit();
    error_log("Transacción completada con éxito");

    jsonResponse(true, [
        'orderId' => $pedido_id,
        'facturaId' => $factura_id,
        'message' => 'Pedido procesado correctamente'
    ]);

} catch (PDOException $e) {
    if (isset($conn)) {
        $conn->rollBack();
    }
    error_log("Error en la transacción: " . $e->getMessage());
    jsonResponse(false, [], 'Error al procesar el pago: ' . $e->getMessage(), 500);
} catch (Exception $e) {
    error_log("Error general: " . $e->getMessage());
    jsonResponse(false, [], 'Error inesperado: ' . $e->getMessage(), 500);
}

error_log("=== Fin del proceso de pago ===");
?>