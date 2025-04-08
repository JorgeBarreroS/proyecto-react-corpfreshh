<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'cone444.php';
$conexion = conectar();

// Leer y validar el JSON recibido
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['correo_usuario']) || !isset($data['codigo'])) {
    echo json_encode(["success" => false, "message" => "Faltan datos"]);
    exit;
}

$correo = $data['correo_usuario'];
$codigo = $data['codigo'];

// Verificar código en la tabla codigos_reset
$sql = "SELECT * FROM codigos_reset WHERE correo_usuario = ? AND codigo = ? AND creado_en >= NOW() - INTERVAL 10 MINUTE";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("ss", $correo, $codigo);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(["success" => true, "message" => "Código válido"]);
} else {
    echo json_encode(["success" => false, "message" => "Código inválido o expirado"]);
}
