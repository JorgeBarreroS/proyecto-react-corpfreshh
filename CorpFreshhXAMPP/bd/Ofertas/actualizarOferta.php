<?php
// actualizarOferta.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar solicitudes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Solo necesitamos devolver los encabezados y un código de estado 200
    exit(0);
}

include_once '../conexion.php';

// Obtener datos del body
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id_oferta'])) {
    echo json_encode(['success' => false, 'message' => 'Falta el ID de la oferta']);
    exit;
}

try {
    $sql = "UPDATE ofertas_especiales SET 
            titulo = :titulo, 
            descripcion = :descripcion, 
            porcentaje_descuento = :porcentaje_descuento, 
            fecha_inicio = :fecha_inicio,
            fecha_fin = :fecha_fin,
            activo = :activo,
            texto_boton = :texto_boton
            WHERE id_oferta = :id_oferta";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':id_oferta', $data['id_oferta']);
    $stmt->bindParam(':titulo', $data['titulo']);
    $stmt->bindParam(':descripcion', $data['descripcion']);
    $stmt->bindParam(':porcentaje_descuento', $data['porcentaje_descuento']);
    $stmt->bindParam(':fecha_inicio', $data['fecha_inicio']);
    $stmt->bindParam(':fecha_fin', $data['fecha_fin']);
    $stmt->bindParam(':activo', $data['activo']);
    $stmt->bindParam(':texto_boton', $data['texto_boton']);
    
    $stmt->execute();
    
    echo json_encode(['success' => true]);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}