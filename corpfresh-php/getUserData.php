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
    "message" => "Error al obtener datos del usuario"
];

try {
    require 'conexiones.php';

    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['email'])) {
        throw new Exception("Email no proporcionado");
    }

    $email = trim(htmlspecialchars($data['email']));

    // Conexión a la base de datos
    $cnn = Conexion::getConexion();

    // Consulta para obtener los datos del usuario y cliente
    // Ajusta esta consulta según tu estructura de base de datos
    $sentencia = $cnn->prepare("
        SELECT u.t_id_usuario, u.correo, u.t_id_rol, 
               c.nombre, c.apellido, c.telefono, c.direccion
        FROM t_usuario u
        LEFT JOIN t_cliente c ON u.t_id_usuario = c.t_id_usuario
        WHERE u.correo = :email
    ");

    if (!$sentencia) {
        throw new Exception("Error en la consulta: " . implode(" ", $cnn->errorInfo()));
    }

    $sentencia->execute(['email' => $email]);
    $usuario = $sentencia->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        throw new Exception("Usuario no encontrado");
    }

    $response = [
        "success" => true,
        "message" => "Datos obtenidos correctamente",
        "user" => [
            "id" => $usuario['t_id_usuario'],
            "email" => $usuario['correo'],
            "rol" => intval($usuario['t_id_rol']),
            "nombre" => $usuario['nombre'] ?? null,
            "apellido" => $usuario['apellido'] ?? null,
            "telefono" => $usuario['telefono'] ?? null,
            "direccion" => $usuario['direccion'] ?? null
            // Agrega más campos según tu tabla
        ]
    ];
} catch (Exception $e) {
    http_response_code(400);
    $response["message"] = $e->getMessage();
}

echo json_encode($response);
?>