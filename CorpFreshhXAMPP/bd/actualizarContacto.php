<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once 'conexion.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->id)) {
    try {
        $query = $pdo->prepare("UPDATE contactos SET 
            nombre = :nombre, 
            email = :email, 
            mensaje = :mensaje, 
            fecha_creacion = :fecha_creacion,
            estado = :estado
            WHERE id = :id");

        $query->bindParam(':id', $data->id);
        $query->bindParam(':nombre', $data->nombre);
        $query->bindParam(':email', $data->email);
        $query->bindParam(':mensaje', $data->mensaje);
        $query->bindParam(':fecha_creacion', $data->fecha_creacion);
        $query->bindParam(':estado', $data->estado);
        
        $query->execute();

        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['error' => 'Faltan parámetros requeridos']);
}