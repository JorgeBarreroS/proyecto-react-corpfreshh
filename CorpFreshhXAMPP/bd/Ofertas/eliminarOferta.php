<?php
// eliminarOferta.php
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
    $sql = "DELETE FROM ofertas_especiales WHERE id_oferta = :id_oferta";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':id_oferta', $data['id_oferta']);
    
    $stmt->execute();
    
    echo json_encode(['success' => true]);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}