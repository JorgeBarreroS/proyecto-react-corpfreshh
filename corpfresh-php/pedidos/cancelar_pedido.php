<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verify request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit();
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Get JSON data from request body
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['pedido_id']) || !isset($data['usuario'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Faltan parámetros requeridos (pedido_id, usuario)']);
    exit();
}

// Database connection parameters
$host = 'corpfresh2025.mysql.database.azure.com';
$dbname = 'corpfreshh';
$username = 'admin_corpfreshh';
$password = 'Corp2027@';

try {
    // Create database connection
    $conn = new mysqli($host, $username, $password, $dbname);
    
    if ($conn->connect_error) {
        throw new Exception('Error de conexión: ' . $conn->connect_error);
    }

    // Sanitize inputs
    $pedido_id = (int)$data['pedido_id'];
    $usuario = $conn->real_escape_string($data['usuario']);

    // First, verify that the order belongs to the user and is in a cancellable state
    $sql_check = "SELECT id, estado FROM pedidos 
                 WHERE id = ? AND correo_usuario = ? 
                 AND estado IN ('pendiente', 'procesando')";
    
    $stmt_check = $conn->prepare($sql_check);
    if (!$stmt_check) {
        throw new Exception('Error en la preparación de consulta: ' . $conn->error);
    }

    $stmt_check->bind_param("is", $pedido_id, $usuario);
    if (!$stmt_check->execute()) {
        throw new Exception('Error al ejecutar consulta: ' . $stmt_check->error);
    }

    $result_check = $stmt_check->get_result();
    
    if ($result_check->num_rows === 0) {
        throw new Exception('No se puede cancelar el pedido: no existe, no pertenece al usuario o no está en un estado que permita cancelación');
    }

    // If check passed, update the order status to 'cancelado'
    $sql_update = "UPDATE pedidos SET estado = 'cancelado' WHERE id = ?";
    
    $stmt_update = $conn->prepare($sql_update);
    if (!$stmt_update) {
        throw new Exception('Error en la preparación de actualización: ' . $conn->error);
    }

    $stmt_update->bind_param("i", $pedido_id);
    if (!$stmt_update->execute()) {
        throw new Exception('Error al actualizar el pedido: ' . $stmt_update->error);
    }

    if ($stmt_update->affected_rows === 0) {
        throw new Exception('No se pudo cancelar el pedido');
    }

    // Successfully cancelled the order
    echo json_encode([
        'success' => true, 
        'message' => 'Pedido cancelado correctamente',
        'pedido_id' => $pedido_id
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} finally {
    // Close database connections
    if (isset($stmt_check)) $stmt_check->close();
    if (isset($stmt_update)) $stmt_update->close();
    if (isset($conn)) $conn->close();
}
?>