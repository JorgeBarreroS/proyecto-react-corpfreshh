<?php
// agregarOferta.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

include_once '../conexion.php';

// Obtener datos del body
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['titulo']) || !isset($data['fecha_fin'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos obligatorios']);
    exit;
}

try {
    $sql = "INSERT INTO ofertas_especiales (titulo, descripcion, porcentaje_descuento, fecha_inicio, fecha_fin, activo, texto_boton) 
            VALUES (:titulo, :descripcion, :porcentaje_descuento, :fecha_inicio, :fecha_fin, :activo, :texto_boton)";
    
    $stmt = $pdo->prepare($sql);
    
    // Valores por defecto para campos opcionales
    $fecha_inicio = !empty($data['fecha_inicio']) ? $data['fecha_inicio'] : date('Y-m-d H:i:s');
    $descripcion = !empty($data['descripcion']) ? $data['descripcion'] : '';
    $texto_boton = !empty($data['texto_boton']) ? $data['texto_boton'] : 'Comprar Ahora';
    
    $stmt->bindParam(':titulo', $data['titulo']);
    $stmt->bindParam(':descripcion', $descripcion);
    $stmt->bindParam(':porcentaje_descuento', $data['porcentaje_descuento']);
    $stmt->bindParam(':fecha_inicio', $fecha_inicio);
    $stmt->bindParam(':fecha_fin', $data['fecha_fin']);
    $stmt->bindParam(':activo', $data['activo']);
    $stmt->bindParam(':texto_boton', $texto_boton);
    
    $stmt->execute();
    $id_oferta = $pdo->lastInsertId();
    
    echo json_encode(['success' => true, 'id_oferta' => $id_oferta]);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}