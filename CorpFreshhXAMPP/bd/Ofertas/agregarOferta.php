<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

include_once '../conexion.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['titulo']) || !isset($data['fecha_fin'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos obligatorios']);
    exit;
}

try {
    $sql = "INSERT INTO ofertas_especiales 
            (titulo, descripcion, porcentaje_descuento, fecha_inicio, fecha_fin, activo, texto_boton, id_producto, id_categoria) 
            VALUES (:titulo, :descripcion, :porcentaje_descuento, :fecha_inicio, :fecha_fin, :activo, :texto_boton, :id_producto, :id_categoria)";
    
    $stmt = $pdo->prepare($sql);
    
    $fecha_inicio = !empty($data['fecha_inicio']) ? $data['fecha_inicio'] : date('Y-m-d H:i:s');
    $descripcion = !empty($data['descripcion']) ? $data['descripcion'] : '';
    $texto_boton = !empty($data['texto_boton']) ? $data['texto_boton'] : 'Comprar Ahora';
    $id_producto = !empty($data['id_producto']) ? $data['id_producto'] : null;
    $id_categoria = !empty($data['id_categoria']) ? $data['id_categoria'] : null;
    
    $stmt->bindParam(':titulo', $data['titulo']);
    $stmt->bindParam(':descripcion', $descripcion);
    $stmt->bindParam(':porcentaje_descuento', $data['porcentaje_descuento']);
    $stmt->bindParam(':fecha_inicio', $fecha_inicio);
    $stmt->bindParam(':fecha_fin', $data['fecha_fin']);
    $stmt->bindParam(':activo', $data['activo']);
    $stmt->bindParam(':texto_boton', $texto_boton);
    $stmt->bindParam(':id_producto', $id_producto);
    $stmt->bindParam(':id_categoria', $id_categoria);
    
    $stmt->execute();
    $id_oferta = $pdo->lastInsertId();
    
    echo json_encode(['success' => true, 'id_oferta' => $id_oferta]);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}