<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'conexion.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->id_pedido)) {
    try {
        $checkQuery = $pdo->prepare("SELECT id FROM pedidos WHERE id = :id_pedido");
        $checkQuery->bindParam(':id_pedido', $data->id_pedido);
        $checkQuery->execute();
        
        if ($checkQuery->rowCount() === 0) {
            echo json_encode([
                'success' => false,
                'message' => 'El pedido con ID ' . $data->id_pedido . ' no existe.'
            ]);
            exit;
        }
        
        $query = $pdo->prepare("DELETE FROM pedidos WHERE id = :id_pedido");
        $query->bindParam(':id_pedido', $data->id_pedido);
        $query->execute();
        
        echo json_encode([
            'success' => true,
            'message' => 'Pedido eliminado con éxito'
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'No se proporcionó ID de pedido'
    ]);
}