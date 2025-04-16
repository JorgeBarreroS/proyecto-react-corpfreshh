<?php
// obtenerOfertas.php
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
    $sql = "SELECT * FROM ofertas_especiales ORDER BY id_oferta DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $ofertas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Asegurar que activo siempre se envía como string
    foreach ($ofertas as &$oferta) {
        $oferta['activo'] = (string)$oferta['activo'];
    }
    
    echo json_encode($ofertas);
} catch(PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}