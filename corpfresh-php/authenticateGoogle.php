<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Manejo de preflight (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'conexiones.php';

$response = ["success" => false, "message" => "Error al autenticar con Google"];

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['email']) || empty(trim($data['email']))) {
        throw new Exception("Email es requerido");
    }

    $email = trim($data['email']);
    $name = isset($data['name']) ? trim($data['name']) : 'Usuario';
    $avatar = isset($data['avatar']) ? trim($data['avatar']) : '';

    $cnn = Conexion::getConexion();

    // Verificar si el usuario existe
    $checkStmt = $cnn->prepare("SELECT id_usuario, nombre_usuario, apellido_usuario, correo_usuario, id_rol FROM usuario WHERE correo_usuario = :email");
    $checkStmt->execute(['email' => $email]);
    $user = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Usuario existe, devolver datos
        $response = [
            "success" => true,
            "user" => [
                "id" => $user['id_usuario'],
                "name" => $user['nombre_usuario'],
                "email" => $user['correo_usuario'],
                "rol" => $user['id_rol']
            ],
            "isGoogleUser" => false
        ];
    } else {
        // Usuario no existe, crear uno nuevo con datos mínimos
        $nombre = explode(' ', $name)[0] ?? 'Usuario';
        $apellido = count(explode(' ', $name)) > 1 ? implode(' ', array_slice(explode(' ', $name), 1)) : 'Google';
        
        $insertStmt = $cnn->prepare("
            INSERT INTO usuario (
                nombre_usuario, apellido_usuario, correo_usuario, id_rol
            ) VALUES (:nombre, :apellido, :email, 2)
        ");
        
        $insertStmt->execute([
            'nombre' => $nombre,
            'apellido' => $apellido,
            'email' => $email
        ]);

        $newUserId = $cnn->lastInsertId();
        
        $response = [
            "success" => true,
            "user" => [
                "id" => $newUserId,
                "name" => $nombre,
                "email" => $email,
                "rol" => 2
            ],
            "isGoogleUser" => true
        ];
    }
} catch (Exception $e) {
    http_response_code(400);
    $response["message"] = $e->getMessage();
}

echo json_encode($response);
?>