<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once 'conexion.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->id_detalle)) {
    try {
        // Verificar si el detalle existe antes de eliminarlo
        $checkDetalle = $pdo->prepare("SELECT id FROM pedidos_detalle WHERE id = :id_detalle");
        $checkDetalle->bindParam(':id_detalle', $data->id_detalle);
        $checkDetalle->execute();
        
        if ($checkDetalle->rowCount() === 0) {
            echo json_encode([
                'success' => false,
                'message' => 'El detalle de pedido con ID ' . $data->id_detalle . ' no existe.'
            ]);
            exit;
        }
        
        // Eliminar el detalle del pedido
        $query = $pdo->prepare("DELETE FROM pedidos_detalle WHERE id = :id_detalle");
        $query->bindParam(':id_detalle', $data->id_detalle);
        $query->execute();

        echo json_encode([
            'success' => true,
            'message' => 'Detalle de pedido eliminado correctamente'
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
        'message' => 'Falta el ID del detalle de pedido'
    ]);
}