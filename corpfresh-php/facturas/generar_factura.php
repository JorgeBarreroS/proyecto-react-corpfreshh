<?php
require_once 'tcpdf/tcpdf.php'; // Asegúrate de tener TCPDF instalado

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/pdf");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

// Conexión a la base de datos
$host = 'localhost';
$dbname = 'corpfreshh';
$username = 'root';
$password = '';

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    die('Error de conexión: ' . $conn->connect_error);
}

if (!isset($_GET['pedido_id'])) {
    http_response_code(400);
    die('Falta el parámetro pedido_id');
}

$pedido_id = intval($_GET['pedido_id']);

try {
    // Obtener información del pedido
    $sql_pedido = "SELECT p.*, u.nombre_usuario 
                   FROM pedidos p
                   JOIN usuario u ON p.usuario = u.correo_usuario
                   WHERE p.id = ?";
    
    $stmt_pedido = $conn->prepare($sql_pedido);
    if (!$stmt_pedido) {
        throw new Exception("Error en la preparación de consulta de pedido: " . $conn->error);
    }
    
    $stmt_pedido->bind_param("i", $pedido_id);
    
    if (!$stmt_pedido->execute()) {
        throw new Exception("Error al obtener el pedido: " . $stmt_pedido->error);
    }
    
    $result_pedido = $stmt_pedido->get_result();
    $pedido = $result_pedido->fetch_assoc();
    $stmt_pedido->close();
    
    if (!$pedido) {
        throw new Exception("Pedido no encontrado");
    }
    
    // Obtener items del pedido
    $sql_items = "SELECT * FROM pedidos_detalle WHERE pedido_id = ?";
    $stmt_items = $conn->prepare($sql_items);
    if (!$stmt_items) {
        throw new Exception("Error en la preparación de consulta de items: " . $conn->error);
    }
    
    $stmt_items->bind_param("i", $pedido_id);
    
    if (!$stmt_items->execute()) {
        throw new Exception("Error al obtener items del pedido: " . $stmt_items->error);
    }
    
    $items = $stmt_items->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt_items->close();
    
    // Crear PDF
    $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
    
    $pdf->SetCreator('CorpFresh');
    $pdf->SetAuthor('CorpFresh');
    $pdf->SetTitle('Factura #' . $pedido_id);
    $pdf->SetSubject('Factura de compra');
    
    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);
    $pdf->AddPage();
    
    // Logo (ajusta la ruta según tu estructura)
    // $pdf->Image('ruta/a/tu/logo.png', 10, 10, 50, 0, 'PNG');
    
    // Información de la empresa
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->Cell(0, 10, 'CorpFresh S.A.S.', 0, 1, 'R');
    $pdf->SetFont('helvetica', '', 10);
    $pdf->Cell(0, 5, 'NIT: 900.123.456-7', 0, 1, 'R');
    $pdf->Cell(0, 5, 'Dirección: Calle 123 #45-67', 0, 1, 'R');
    $pdf->Cell(0, 5, 'Teléfono: +57 1 2345678', 0, 1, 'R');
    $pdf->Cell(0, 5, 'Email: info@corpfresh.com', 0, 1, 'R');
    
    // Título
    $pdf->SetFont('helvetica', 'B', 16);
    $pdf->Cell(0, 20, 'FACTURA DE VENTA', 0, 1, 'C');
    
    // Información del cliente
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->Cell(0, 10, 'Datos del Cliente', 0, 1);
    $pdf->SetFont('helvetica', '', 10);
    $pdf->Cell(0, 5, 'Nombre: ' . $pedido['nombre_usuario'], 0, 1);
    $pdf->Cell(0, 5, 'Email: ' . $pedido['usuario'], 0, 1);
    $pdf->Cell(0, 5, 'Dirección: ' . $pedido['direccion_entrega'], 0, 1);
    $pdf->Cell(0, 5, 'Teléfono: ' . $pedido['telefono_contacto'], 0, 1);
    
    // Detalles de la factura
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->Cell(0, 10, 'Detalles de la Factura', 0, 1);
    $pdf->SetFont('helvetica', '', 10);
    $pdf->Cell(0, 5, 'Número de factura: ' . $pedido_id, 0, 1);
    $pdf->Cell(0, 5, 'Fecha: ' . date('d/m/Y', strtotime($pedido['fecha_pedido'])), 0, 1);
    $pdf->Cell(0, 5, 'Método de pago: ' . $pedido['metodo_pago'], 0, 1);
    
    // Tabla de productos
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->Cell(80, 7, 'Producto', 1, 0, 'C');
    $pdf->Cell(30, 7, 'Precio unitario', 1, 0, 'C');
    $pdf->Cell(20, 7, 'Cantidad', 1, 0, 'C');
    $pdf->Cell(30, 7, 'Subtotal', 1, 1, 'C');
    
    $pdf->SetFont('helvetica', '', 10);
    foreach ($items as $item) {
        $pdf->Cell(80, 7, $item['nombre_producto'], 1, 0);
        $pdf->Cell(30, 7, '$' . number_format($item['precio_unitario'], 2), 1, 0, 'R');
        $pdf->Cell(20, 7, $item['cantidad'], 1, 0, 'C');
        $pdf->Cell(30, 7, '$' . number_format($item['subtotal'], 2), 1, 1, 'R');
    }
    
    // Totales
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->Cell(130, 7, 'Subtotal:', 1, 0, 'R');
    $pdf->Cell(30, 7, '$' . number_format($pedido['total'] - $pedido['costo_envio'] - $pedido['impuestos'], 2), 1, 1, 'R');
    
    $pdf->Cell(130, 7, 'Envío:', 1, 0, 'R');
    $pdf->Cell(30, 7, '$' . number_format($pedido['costo_envio'], 2), 1, 1, 'R');
    
    $pdf->Cell(130, 7, 'Impuestos:', 1, 0, 'R');
    $pdf->Cell(30, 7, '$' . number_format($pedido['impuestos'], 2), 1, 1, 'R');
    
    $pdf->Cell(130, 7, 'TOTAL:', 1, 0, 'R');
    $pdf->Cell(30, 7, '$' . number_format($pedido['total'], 2), 1, 1, 'R');
    
    // Notas
    $pdf->SetFont('helvetica', 'I', 8);
    $pdf->Cell(0, 10, 'Gracias por su compra en CorpFresh', 0, 1, 'C');
    
    // Generar PDF
    $pdf->Output('factura_' . $pedido_id . '.pdf', 'D');
    
} catch (Exception $e) {
    http_response_code(500);
    die('Error al generar factura: ' . $e->getMessage());
}

$conn->close();
?>