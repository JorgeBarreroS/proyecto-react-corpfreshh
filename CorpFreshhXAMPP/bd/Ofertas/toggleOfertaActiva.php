<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include_once '../conexion.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id_oferta']) || !isset($data['activo'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos']);
    exit;
}

try {
    // Asegurar que activo sea 0 o 1
    $activo = $data['activo'] === '1' ? '1' : '0';
    
    $sql = "UPDATE ofertas_especiales SET activo = :activo WHERE id_oferta = :id_oferta";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':id_oferta', $data['id_oferta']);
    $stmt->bindParam(':activo', $activo);
    
    $stmt->execute();
    
    echo json_encode(['success' => true]);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}