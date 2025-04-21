<?php
// IMPORTANTE: Desactivar todos los errores de salida
error_reporting(0);
ini_set('display_errors', 0);

// Iniciar buffer de salida desde el principio
ob_start();

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Manejar preflight requests de CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    exit();
}

// Intentar incluir el archivo de conexión
$connection_file = 'conexion.php';
if (!file_exists($connection_file)) {
    ob_end_clean();
    http_response_code(500);
    die(json_encode(['error' => 'Archivo de conexión no encontrado']));
}

include $connection_file;

// Verificar que la variable $conn existe y es una conexión válida
if (!isset($conn) || !($conn instanceof mysqli)) {
    ob_end_clean();
    http_response_code(500);
    die(json_encode(['error' => 'Variable de conexión no válida']));
}

// Si la conexión falla, devolver un error JSON
if ($conn->connect_error) {
    ob_end_clean();
    http_response_code(500);
    die(json_encode(['error' => 'Error de conexión a la base de datos: ' . $conn->connect_error]));
}

// Establecer charset UTF-8 para MySQL
if (!$conn->set_charset("utf8")) {
    ob_end_clean();
    http_response_code(500);
    die(json_encode(['error' => 'Error al establecer charset: ' . $conn->error]));
}

// Función para manejar errores
function responderError($mensaje, $codigo = 400) {
    ob_end_clean();
    http_response_code($codigo);
    die(json_encode(['success' => false, 'error' => $mensaje]));
}

// Validar usuario
function validarUsuario($usuario, $conn) {
    if (empty($usuario)) {
        return false;
    }
    
    $sql = "SELECT COUNT(*) as existe FROM usuario WHERE correo_usuario = ?";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        responderError("Error en la preparación de consulta de usuario: " . $conn->error, 500);
    }
    
    $stmt->bind_param("s", $usuario);
    
    if (!$stmt->execute()) {
        responderError("Error ejecutando consulta de validación: " . $stmt->error, 500);
    }
    
    $result = $stmt->get_result();
    if (!$result) {
        responderError("Error obteniendo resultado de validación: " . $stmt->error, 500);
    }
    
    $row = $result->fetch_assoc();
    $stmt->close();
    
    return (isset($row['existe']) && $row['existe'] > 0);
}

// Obtener datos enviados en la solicitud
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Obtener carrito de usuario
            if (!isset($_GET['usuario']) || empty($_GET['usuario'])) {
                responderError("Falta el parámetro usuario");
            }

            $usuario = $_GET['usuario'];
            
            // Verificar que el usuario existe
            if (!validarUsuario($usuario, $conn)) {
                responderError("Usuario no válido");
            }

            // Consulta para obtener los productos en el carrito del usuario
            $sql = "SELECT c.id_carrito, c.id_producto, c.nombre, c.precio, c.imagen, 
                          c.cantidad, c.fecha_agregado, c.color, c.talla
                   FROM carrito c
                   WHERE c.usuario = ?
                   ORDER BY c.fecha_agregado DESC";
            
            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                responderError("Error en la preparación de consulta: " . $conn->error, 500);
            }
            $stmt->bind_param("s", $usuario);
            
            if (!$stmt->execute()) {
                responderError("Error al ejecutar consulta: " . $stmt->error, 500);
            }
            
            $result = $stmt->get_result();
            
            $carrito = [];
            while ($row = $result->fetch_assoc()) {
                $carrito[] = $row;
            }
            
            $stmt->close();
            ob_end_clean();
            echo json_encode($carrito);
            break;

        case 'POST':
            // Agregar producto al carrito
            $json_input = file_get_contents("php://input");
            $data = json_decode($json_input);
            
            if (!$data) {
                responderError("Datos JSON inválidos: " . json_last_error_msg());
            }
            
            if (!isset($data->id_producto) || !isset($data->usuario) || !isset($data->cantidad)) {
                responderError("Faltan datos requeridos");
            }

            $id_producto = intval($data->id_producto);
            $nombre = $data->nombre ?? '';
            $precio = floatval($data->precio ?? 0);
            $imagen = $data->imagen ?? '';
            $cantidad = intval($data->cantidad);
            $usuario = $data->usuario;
            $color = $data->color ?? null;
            $talla = $data->talla ?? null;

            // Verificar que el usuario existe
            if (!validarUsuario($usuario, $conn)) {
                responderError("Usuario no válido");
            }

            // Verificar si el producto ya está en el carrito
            $sql_check = "SELECT id_carrito, cantidad FROM carrito WHERE usuario = ? AND id_producto = ?";
            $params = [$usuario, $id_producto];
            $types = "si";
            
            if ($color !== null) {
                $sql_check .= " AND color = ?";
                $params[] = $color;
                $types .= "s";
            } else {
                $sql_check .= " AND color IS NULL";
            }
            
            if ($talla !== null) {
                $sql_check .= " AND talla = ?";
                $params[] = $talla;
                $types .= "s";
            } else {
                $sql_check .= " AND talla IS NULL";
            }
            
            $stmt_check = $conn->prepare($sql_check);
            if (!$stmt_check) {
                responderError("Error en la preparación de consulta de verificación: " . $conn->error, 500);
            }
            
            $stmt_check->bind_param($types, ...$params);
            
            if (!$stmt_check->execute()) {
                responderError("Error al ejecutar verificación: " . $stmt_check->error, 500);
            }
            
            $result_check = $stmt_check->get_result();
            
            if ($result_check->num_rows > 0) {
                // Producto ya existe, actualizar cantidad
                $row = $result_check->fetch_assoc();
                $id_carrito = $row['id_carrito'];
                $nueva_cantidad = $row['cantidad'] + $cantidad;
                
                $sql_update = "UPDATE carrito SET cantidad = ? WHERE id_carrito = ?";
                $stmt_update = $conn->prepare($sql_update);
                if (!$stmt_update) {
                    responderError("Error en la preparación de actualización: " . $conn->error, 500);
                }
                $stmt_update->bind_param("ii", $nueva_cantidad, $id_carrito);
                
                if ($stmt_update->execute()) {
                    $stmt_update->close();
                    ob_end_clean();
                    echo json_encode(['success' => true, 'message' => 'Cantidad actualizada en el carrito']);
                } else {
                    responderError("Error al actualizar la cantidad: " . $stmt_update->error, 500);
                }
            } else {
                // Producto nuevo, insertar en carrito
                $sql_insert = "INSERT INTO carrito (id_producto, nombre, precio, imagen, cantidad, usuario, color, talla) 
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                $stmt_insert = $conn->prepare($sql_insert);
                if (!$stmt_insert) {
                    responderError("Error en la preparación de inserción: " . $conn->error, 500);
                }
                
                // Inicializar las variables en caso de que sean null
                $nombre = $nombre ?? '';
                $imagen = $imagen ?? '';
                $color = $color ?? null;
                $talla = $talla ?? null;
                
                $stmt_insert->bind_param("isdsisss", $id_producto, $nombre, $precio, $imagen, $cantidad, $usuario, $color, $talla);
                
                if ($stmt_insert->execute()) {
                    $stmt_insert->close();
                    ob_end_clean();
                    echo json_encode(['success' => true, 'message' => 'Producto agregado al carrito']);
                } else {
                    responderError("Error al agregar al carrito: " . $stmt_insert->error, 500);
                }
            }
            $stmt_check->close();
            break;

        case 'PUT':
            // Actualizar cantidad en el carrito
            $json_input = file_get_contents("php://input");
            $data = json_decode($json_input);
            
            if (!$data) {
                responderError("Datos JSON inválidos: " . json_last_error_msg());
            }
            
            if (!isset($data->id_carrito) || !isset($data->cantidad)) {
                responderError("Faltan datos requeridos (id_carrito o cantidad)");
            }

            $id_carrito = intval($data->id_carrito);
            $cantidad = intval($data->cantidad);

            // Verificar que la cantidad sea válida
            if ($cantidad < 1) {
                responderError("La cantidad debe ser al menos 1");
            }

            $sql = "UPDATE carrito SET cantidad = ? WHERE id_carrito = ?";
            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                responderError("Error en la preparación de consulta: " . $conn->error, 500);
            }
            $stmt->bind_param("ii", $cantidad, $id_carrito);
            
            if ($stmt->execute()) {
                ob_end_clean();
                echo json_encode(['success' => true, 'message' => 'Cantidad actualizada']);
            } else {
                responderError("Error al actualizar cantidad: " . $stmt->error, 500);
            }
            $stmt->close();
            break;

        case 'DELETE':
            // Eliminar producto del carrito o vaciar carrito
            $json_input = file_get_contents("php://input");
            $data = json_decode($json_input);
            
            if (!$data) {
                responderError("Datos JSON inválidos: " . json_last_error_msg());
            }
            
            if (isset($data->vaciar) && $data->vaciar === true) {
                // Vaciar todo el carrito
                if (!isset($data->usuario)) {
                    responderError("Falta el parámetro usuario para vaciar carrito");
                }
                
                $usuario = $data->usuario;
                
                // Verificar que el usuario existe
                if (!validarUsuario($usuario, $conn)) {
                    responderError("Usuario no válido");
                }
                
                $sql = "DELETE FROM carrito WHERE usuario = ?";
                $stmt = $conn->prepare($sql);
                if (!$stmt) {
                    responderError("Error en la preparación de consulta: " . $conn->error, 500);
                }
                $stmt->bind_param("s", $usuario);
            } else {
                // Eliminar un producto específico
                if (!isset($data->id_carrito)) {
                    responderError("Falta el parámetro id_carrito");
                }
                
                $id_carrito = intval($data->id_carrito);
                $sql = "DELETE FROM carrito WHERE id_carrito = ?";
                $stmt = $conn->prepare($sql);
                if (!$stmt) {
                    responderError("Error en la preparación de consulta: " . $conn->error, 500);
                }
                $stmt->bind_param("i", $id_carrito);
            }
            
            if ($stmt->execute()) {
                ob_end_clean();
                echo json_encode(['success' => true, 'message' => 'Operación completada']);
            } else {
                responderError("Error al eliminar: " . $stmt->error, 500);
            }
            $stmt->close();
            break;
        
        default:
            responderError("Método no soportado", 405);
            break;
    }
} catch (Exception $e) {
    responderError("Error en el servidor: " . $e->getMessage(), 500);
}

// Cerrar la conexión sólo después de que todas las operaciones hayan terminado
if (isset($conn) && $conn instanceof mysqli) {
    $conn->close();
}

// Limpiar el buffer y enviar la salida
ob_end_flush();
?>