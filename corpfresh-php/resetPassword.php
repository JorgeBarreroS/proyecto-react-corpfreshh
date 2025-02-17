<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Manejo de solicitudes OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$response = ["success" => false, "message" => "Error de autenticación"];

try {
    require 'conexiones.php';

    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['email']) || !isset($data['newPassword']) || !isset($data['confirmPassword'])) {
        throw new Exception("Datos incompletos: email y contraseñas son requeridos.");
    }

    $email = $data['email'];
    $newPassword = $data['newPassword'];
    $confirmPassword = $data['confirmPassword'];

    if ($newPassword !== $confirmPassword) {
        throw new Exception("Las contraseñas no coinciden.");
    }

    $conn = Conexion::getConexion();

    // Verificar si el correo existe
    $sql = "SELECT correo FROM t_usuario WHERE correo = :email";
    $stmt = $conn->prepare($sql);
    $stmt->execute(['email' => $email]);

    if ($stmt->rowCount() === 0) {
        throw new Exception("Correo no encontrado.");
    }

    // Encriptar la nueva contraseña
    $encryptedPassword = openssl_encrypt($newPassword, 'aes-128-cbc', 'almuerzo', 0, '1234567890123456');

    // Actualizar la contraseña
    $sql = "UPDATE t_usuario SET contraseña = :newPassword WHERE correo = :email";
    $stmt = $conn->prepare($sql);
    $stmt->execute(['newPassword' => $encryptedPassword, 'email' => $email]);

    $response = ["success" => true, "message" => "Contraseña actualizada exitosamente"];
} catch (Exception $e) {
    http_response_code(400);
    $response["message"] = $e->getMessage();
}

echo json_encode($response);
?>
