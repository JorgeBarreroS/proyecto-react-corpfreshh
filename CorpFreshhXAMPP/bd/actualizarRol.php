<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once 'conexion.php';

$input = json_decode(file_get_contents('php://input'), true);

if (isset($input['id_rol'], $input['nombre_rol'])) {
    try {
        $query = $pdo->prepare("UPDATE rol SET nombre_rol = :nombre_rol WHERE id_rol = :id_rol");
        $query->bindParam(':id_rol', $input['id_rol']);
        $query->bindParam(':nombre_rol', $input['nombre_rol']);
        $query->execute();

        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['error' => 'Faltan datos para actualizar el rol']);
}
?>
