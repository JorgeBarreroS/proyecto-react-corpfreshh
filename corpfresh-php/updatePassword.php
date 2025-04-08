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

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['correo_usuario'], $data['nueva_contrasena'], $data['codigo'])) {
    echo json_encode(["success" => false, "message" => "Campos faltantes"]);
    exit();
}

$correo = $data['correo_usuario'];
$nueva = $data['nueva_contrasena'];
$codigo = $data['codigo'];

// Verificar que el código exista y sea válido
$sql = "SELECT * FROM codigos_reset WHERE correo_usuario = ? AND codigo = ? AND creado_en >= NOW() - INTERVAL 10 MINUTE";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("ss", $correo, $codigo);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Código inválido o expirado"]);
    exit();
}

// Obtener ID del usuario por su correo
$sql = "SELECT id_usuario FROM usuario WHERE correo_usuario = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("s", $correo);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
    exit();
}

$row = $result->fetch_assoc();
$id_usuario = $row['id_usuario'];

// Llamar al procedimiento almacenado para encriptar y actualizar contraseña
$sql = "CALL ENCRIPTAR_CONTRASENA(?, ?)";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("is", $id_usuario, $nueva);
$stmt->execute();

// Eliminar el código usado para que no se reutilice
$sql = "DELETE FROM codigos_reset WHERE correo_usuario = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("s", $correo);
$stmt->execute();

echo json_encode(["success" => true, "message" => "Contraseña actualizada"]);
?>
