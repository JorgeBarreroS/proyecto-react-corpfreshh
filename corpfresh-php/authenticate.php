<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

require 'conexiones.php';
require 'encryption.php';

$response = [
    "success" => false,
    "message" => "Error de autenticación"
];

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['email']) || !isset($data['password'])) {
        throw new Exception("Datos incompletos: email y contraseña son requeridos.");
    }

    $email = trim(htmlspecialchars($data['email']));
    $password = trim($data['password']);

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Formato de correo no válido.");
    }

    $cnn = Conexion::getConexion();

    $sentencia = $cnn->prepare("SELECT id_usuario, correo_usuario, id_rol, contraseña FROM usuario WHERE correo_usuario = :email");

    if (!$sentencia) {
        throw new Exception("Error en la consulta: " . implode(" ", $cnn->errorInfo()));
    }

    $sentencia->execute([':email' => $email]);
    $usuario = $sentencia->fetch(PDO::FETCH_OBJ);

    if (!$usuario) {
        throw new Exception("Usuario no encontrado.");
    }

    $desencriptada = decryptPassword($usuario->contraseña);

    if ($desencriptada !== $password) {
        throw new Exception("Contraseña incorrecta.");
    }

    $rol = isset($usuario->id_rol) ? intval($usuario->id_rol) : 0;

    $response = [
        "success" => true,
        "message" => "Autenticación exitosa",
        "user" => [
            "id" => $usuario->id_usuario,
            "email" => $usuario->correo_usuario,
            "rol" => $rol
        ]
    ];
} catch (Exception $e) {
    http_response_code(400);
    $response["message"] = $e->getMessage();
}

echo json_encode($response);
?>
