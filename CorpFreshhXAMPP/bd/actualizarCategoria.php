<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: http://localhost:3000"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once 'conexion.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->id_categoria)) {
    $sql = "UPDATE categoria SET 
            nombre_categoria = :nombre_categoria
            WHERE id_categoria = :id_categoria";

    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':id_categoria', $data->id_categoria);
    $stmt->bindParam(':nombre_categoria', $data->nombre_categoria);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'ID de categoría no proporcionado']);
}
?>
