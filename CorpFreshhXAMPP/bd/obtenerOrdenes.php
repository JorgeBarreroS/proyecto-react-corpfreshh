<?php
header("Access-Control-Allow-Origin: http://localhost:3000"); // Permite solo tu origen React
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once 'conexion.php';

try {
    $query = $pdo->query("SELECT * FROM ordenes");
    $ordenes = $query->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($ordenes);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
