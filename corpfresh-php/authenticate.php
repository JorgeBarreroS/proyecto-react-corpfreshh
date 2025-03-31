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

// Capturar errores
error_reporting(E_ALL);
ini_set('display_errors', 1);

$response = [
    "success" => false,
    "message" => "Error de autenticación"
];

try {
    require 'conexiones.php'; // Asegúrate de que el archivo está correcto

    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['email']) || !isset($data['password'])) {
        throw new Exception("Datos incompletos: email y contraseña son requeridos.");
    }

    $email = trim(htmlspecialchars($data['email']));
    $password = trim($data['password']);

    // Conexión a la base de datos
    $cnn = Conexion::getConexion();

    // Modificación: Agregamos `t_id_rol` para obtener el rol del usuario
    $sentencia = $cnn->prepare("SELECT t_id_usuario, correo, t_id_rol, AES_DECRYPT(contraseña, 'almuerzo') AS contraseña_desencriptada 
                                FROM t_usuario WHERE correo = :email");

    if (!$sentencia) {
        throw new Exception("Error en la consulta: " . implode(" ", $cnn->errorInfo()));
    }

    $sentencia->execute(['email' => $email]);
    $usuario = $sentencia->fetch(PDO::FETCH_OBJ);

    if (!$usuario) {
        throw new Exception("Usuario no encontrado.");
    }

    if ($usuario->contraseña_desencriptada !== $password) {
        throw new Exception("Contraseña incorrecta.");
    }

    // Aseguramos que el rol existe y es numérico
    $rol = isset($usuario->t_id_rol) ? intval($usuario->t_id_rol) : 0;

    $response = [
        "success" => true,
        "message" => "Autenticación exitosa",
        "user" => [
            "id" => $usuario->t_id_usuario,
            "email" => $usuario->correo,
            "rol" => $rol // Agregamos el rol en la respuesta
        ]
    ];
} catch (Exception $e) {
    http_response_code(400);
    $response["message"] = $e->getMessage();
}

echo json_encode($response);
?>
