<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once 'conexion.php';

try {
    $query = $pdo->query("SELECT * FROM facturas");
    $facturas = $query->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($facturas);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}