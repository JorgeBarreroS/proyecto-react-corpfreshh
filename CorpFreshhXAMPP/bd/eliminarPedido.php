<?php
// Configuración de CORS
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Manejar solicitudes preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Solo necesitamos devolver los encabezados y un 200 OK status
    http_response_code(200);
    exit();
}

require_once 'conexion.php';

// Obtener datos del request
$data = json_decode(file_get_contents("php://input"));

if (isset($data->id_pedido)) {
    try {
        // Verificar primero si el pedido existe
        $checkQuery = $pdo->prepare("SELECT id_pedido FROM pedido WHERE id_pedido = :id_pedido");
        $checkQuery->bindParam(':id_pedido', $data->id_pedido);
        $checkQuery->execute();
        
        if ($checkQuery->rowCount() === 0) {
            echo json_encode([
                'success' => false,
                'message' => 'El pedido con ID ' . $data->id_pedido . ' no existe.'
            ]);
            exit;
        }
        
        // Proceder a eliminar
        $query = $pdo->prepare("DELETE FROM pedido WHERE id_pedido = :id_pedido");
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