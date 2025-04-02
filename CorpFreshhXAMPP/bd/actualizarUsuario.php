<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once 'conexion.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->t_id_usuario) && isset($data->correo) && isset($data->rol)) {
    try {
        $query = $pdo->prepare("UPDATE t_usuario SET correo = :correo, rol = :rol WHERE t_id_usuario = :t_id_usuario");
        $query->bindParam(':t_id_usuario', $data->t_id_usuario);
        $query->bindParam(':correo', $data->correo);
        $query->bindParam(':rol', $data->rol);
        $query->execute();

        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
}
