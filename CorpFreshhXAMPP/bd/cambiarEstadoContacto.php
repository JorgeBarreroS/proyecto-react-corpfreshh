<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once 'conexion.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->id) && isset($data->estado)) {
    try {
        $query = $pdo->prepare("UPDATE contactos SET estado = :estado WHERE id = :id");
        $query->bindParam(':id', $data->id);
        $query->bindParam(':estado', $data->estado);
        $query->execute();

        echo json_encode([
            'success' => true,
            'message' => 'Estado actualizado con éxito'
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
        'message' => 'Faltan datos requeridos (id o estado)'
    ]);
}