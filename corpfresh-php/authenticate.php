<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Manejo de solicitudes OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); // Responde con 200 OK para las solicitudes OPTIONS
    exit;
}

$response = [
    "success" => false,
    "message" => "Error de autenticación"
];

try {
    // Asegúrate de incluir el archivo de conexión correctamente
    require 'conexiones.php';

    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['email']) || !isset($data['password'])) {
        throw new Exception("Datos incompletos: email y contraseña son requeridos.");
    }

    $email = $data['email'];
    $password = $data['password'];

    // Ahora la variable $cnn debe ser inicializada correctamente
    $cnn = Conexion::getConexion(); // Asegúrate de que esta línea se ejecute correctamente

    // Realiza la consulta a la base de datos
    $sentencia = $cnn->prepare("SELECT t_id_usuario, correo, AES_DECRYPT(contraseña, 'almuerzo') AS contraseña_desencriptada 
                                FROM t_usuario WHERE correo = :email");
    $sentencia->execute(['email' => $email]);
    $valor = $sentencia->fetch(PDO::FETCH_OBJ);

    if (!$valor) {
        throw new Exception("Usuario no encontrado.");
    }

    if ($valor->contraseña_desencriptada !== $password) {
        throw new Exception("Contraseña incorrecta.");
    }

    $response = [
        "success" => true,
        "message" => "Autenticación exitosa",
        "user" => [
            "id" => $valor->t_id_usuario,
            "email" => $valor->correo
        ]
    ];
} catch (Exception $e) {
    http_response_code(400); // Cambia el código de respuesta a 400 para errores del cliente
    $response["message"] = $e->getMessage(); // Incluye el mensaje del error
}

echo json_encode($response);
?>
