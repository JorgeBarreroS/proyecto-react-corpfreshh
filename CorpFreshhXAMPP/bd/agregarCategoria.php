<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: http://localhost:3000"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Para las solicitudes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'conexion.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->nombre_categoria)) {
    $sql = "INSERT INTO categoria (nombre_categoria) VALUES (:nombre_categoria)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':nombre_categoria', $data->nombre_categoria);
    
    if ($stmt->execute()) {
        // Obtener el ID generado
        $id_categoria = $pdo->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'id_categoria' => $id_categoria
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error al insertar la categoría'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Datos incompletos'
    ]);
}
?>