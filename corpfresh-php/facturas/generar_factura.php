<?php
require_once 'tcpdf/tcpdf.php';

// Configuración de CORS
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/pdf");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

// Conexión a la base de datos
$host = 'localhost';
$dbname = 'corpfreshh';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Validar parámetro pedido_id
    if (!isset($_GET['pedido_id']) || !is_numeric($_GET['pedido_id'])) {
        throw new Exception("ID de pedido inválido", 400);
    }

    $pedido_id = intval($_GET['pedido_id']);

    // 1. Obtener información del pedido
    $stmt = $conn->prepare("
        SELECT p.*, 
               CONCAT(u.nombre_usuario, ' ', u.apellido_usuario) as cliente_nombre,
               u.telefono_usuario,
               u.direccion1_usuario
        FROM pedidos p
        JOIN usuario u ON p.correo_usuario = u.correo_usuario
        WHERE p.id = ?
    ");
    $stmt->execute([$pedido_id]);
    $pedido = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$pedido) {
        throw new Exception("Pedido no encontrado", 404);
    }

    // 2. Obtener items del pedido
    $stmt = $conn->prepare("
        SELECT pd.*, pr.nombre_producto as producto_nombre
        FROM pedidos_detalle pd
        LEFT JOIN producto pr ON pd.producto_id = pr.id_producto
        WHERE pd.pedido_id = ?
    ");
    $stmt->execute([$pedido_id]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. Crear PDF
    $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

    // Configuración del documento
    $pdf->SetCreator('CorpFresh');
    $pdf->SetAuthor('CorpFresh');
    $pdf->SetTitle('Factura #' . $pedido_id);
    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);
    $pdf->AddPage();

    // Logo (opcional)
    // $pdf->Image('ruta/logo.png', 15, 15, 40, 0, 'PNG');

    // Encabezado
    $pdf->SetFont('helvetica', 'B', 14);
    $pdf->Cell(0, 10, 'FACTURA #' . $pedido_id, 0, 1, 'C');
    
    // Información de la empresa
    $pdf->SetFont('helvetica', '', 10);
    $pdf->Cell(0, 5, 'CORPFRESH S.A.S.', 0, 1, 'R');
    $pdf->Cell(0, 5, 'NIT: 900.123.456-7', 0, 1, 'R');
    $pdf->Cell(0, 5, 'Dirección: Calle 123 #45-67, Bogotá', 0, 1, 'R');
    $pdf->Cell(0, 5, 'Teléfono: +57 1 2345678', 0, 1, 'R');
    $pdf->Ln(10);

    // Información del cliente
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->Cell(0, 5, 'Datos del Cliente:', 0, 1);
    $pdf->SetFont('helvetica', '', 10);
    $pdf->Cell(0, 5, 'Nombre: ' . $pedido['cliente_nombre'], 0, 1);
    $pdf->Cell(0, 5, 'Email: ' . $pedido['correo_usuario'], 0, 1);
    $pdf->Cell(0, 5, 'Dirección: ' . $pedido['direccion_entrega'], 0, 1);
    $pdf->Cell(0, 5, 'Teléfono: ' . $pedido['telefono_contacto'], 0, 1);
    $pdf->Ln(10);

    // Detalles del pedido
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->Cell(0, 5, 'Detalles del Pedido:', 0, 1);
    $pdf->SetFont('helvetica', '', 10);
    $pdf->Cell(0, 5, 'Fecha: ' . date('d/m/Y H:i', strtotime($pedido['fecha_pedido'])), 0, 1);
    $pdf->Cell(0, 5, 'Método de Pago: ' . $pedido['metodo_pago'], 0, 1);
    $pdf->Cell(0, 5, 'Estado: ' . ucfirst($pedido['estado']), 0, 1); // Mostrar estado del pedido
    $pdf->Ln(10);

    // Tabla de productos
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->Cell(100, 7, 'Producto', 1, 0);
    $pdf->Cell(30, 7, 'Precio Unit.', 1, 0, 'R');
    $pdf->Cell(20, 7, 'Cantidad', 1, 0, 'C');
    $pdf->Cell(30, 7, 'Subtotal', 1, 1, 'R');
    
    $pdf->SetFont('helvetica', '', 9);
    foreach ($items as $item) {
        $pdf->Cell(100, 6, $item['producto_nombre'] ?? 'Producto no disponible', 1, 0);
        $pdf->Cell(30, 6, '$' . number_format($item['precio_unitario'], 2), 1, 0, 'R');
        $pdf->Cell(20, 6, $item['cantidad'], 1, 0, 'C');
        $pdf->Cell(30, 6, '$' . number_format($item['precio_unitario'] * $item['cantidad'], 2), 1, 1, 'R');
    }

    // Totales
    $subtotal = $pedido['total'] - $pedido['costo_envio'] - $pedido['impuestos'];
    
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->Cell(150, 7, 'Subtotal:', 1, 0, 'R');
    $pdf->Cell(30, 7, '$' . number_format($subtotal, 2), 1, 1, 'R');
    
    $pdf->Cell(150, 7, 'Costo de Envío:', 1, 0, 'R');
    $pdf->Cell(30, 7, '$' . number_format($pedido['costo_envio'], 2), 1, 1, 'R');
    
    $pdf->Cell(150, 7, 'Impuestos:', 1, 0, 'R');
    $pdf->Cell(30, 7, '$' . number_format($pedido['impuestos'], 2), 1, 1, 'R');
    
    $pdf->Cell(150, 7, 'TOTAL:', 1, 0, 'R');
    $pdf->Cell(30, 7, '$' . number_format($pedido['total'], 2), 1, 1, 'R');
    
    // Nota sobre el estado (opcional)
    if ($pedido['estado'] !== 'entregado') {
        $pdf->Ln(5);
        $pdf->SetFont('helvetica', 'I', 8);
        $pdf->Cell(0, 5, 'Nota: Este pedido se encuentra en estado "' . ucfirst($pedido['estado']) . '".', 0, 1);
    }
    
    // Pie de página
    $pdf->SetY(-20);
    $pdf->SetFont('helvetica', 'I', 8);
    $pdf->Cell(0, 5, 'Gracias por su compra - CorpFresh', 0, 1, 'C');
    $pdf->Cell(0, 5, 'Fecha de generación: ' . date('d/m/Y H:i'), 0, 1, 'C');

    // Generar y enviar PDF
    $pdf->Output('factura_' . $pedido_id . '.pdf', 'D');

} catch (Exception $e) {
    // Manejo de errores
    header("Content-Type: application/json");
    http_response_code($e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500);
    echo json_encode([
        'error' => $e->getMessage(),
        'code' => $e->getCode() ?: 500
    ]);
}
?>