<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'conexiones.php';
$response = ["success" => false, "message" => "Error al obtener datos"];

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['email'])) {
        throw new Exception("El campo 'email' es obligatorio");
    }

    $email = $data['email'];

    $cnn = Conexion::getConexion();
    $stmt = $cnn->prepare("
        SELECT nombre_usuario AS nombre, 
               apellido_usuario AS apellido, 
               telefono_usuario AS telefono,
               correo_usuario AS correo, 
               direccion1_usuario AS direccion1,
               direccion2_usuario AS direccion2,
               ciudad_usuario AS ciudad,
               pais_usuario AS pais  
        FROM usuario 
        WHERE correo_usuario = :email
    ");
    $stmt->execute(['email' => $email]);

    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        $response = ["success" => true, "user" => $user];
    } else {
        throw new Exception("Usuario no encontrado");
    }
} catch (Exception $e) {
    http_response_code(400);
    $response["message"] = $e->getMessage();
}

echo json_encode($response);
