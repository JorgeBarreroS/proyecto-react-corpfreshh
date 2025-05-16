<?php
// obtenerOfertaActiva.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar solicitudes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Solo necesitamos devolver los encabezados y un código de estado 200
    exit(0);
}

include_once '../conexion.php';

try {
    $sql = "SELECT * FROM ofertas_especiales WHERE activo = 1 AND 
            fecha_inicio <= NOW() AND fecha_fin >= NOW() 
            ORDER BY fecha_fin ASC LIMIT 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $oferta = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if($oferta) {
        echo json_encode(['success' => true, 'data' => $oferta]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No hay ofertas activas']);
    }
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}