<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: http://localhost:3000"); 
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once 'conexion.php';

// Manejar solicitudes OPTIONS (pre-flight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Obtener los datos enviados en el cuerpo de la solicitud
$data = json_decode(file_get_contents("php://input"));

if (isset($data->id_producto)) {
    // Consulta para eliminar el producto
    $sql = "DELETE FROM producto WHERE id_producto = :id_producto";

    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':id_producto', $data->id_producto);

    // Ejecutar la consulta
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Producto eliminado correctamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al eliminar el producto']);
    }
} else {
    // Respuesta en caso de que no se proporcione un ID de producto válido
    echo json_encode(['success' => false, 'message' => 'ID de producto no proporcionado']);
}
?>