<?php
// Cabeceras necesarias para CORS y JSON
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require 'conexion.php'; // Asegúrate de que este archivo conecte correctamente con tu BD

$data = json_decode(file_get_contents("php://input"), true);

// Validar campos requeridos (solo los que vienen desde React como obligatorios)
$required_fields = [
    "nombre_usuario", "apellido_usuario", "telefono_usuario",
    "correo_usuario", "contraseña"
];

foreach ($required_fields as $field) {
    if (!isset($data[$field]) || empty(trim($data[$field]))) {
        echo json_encode(["success" => false, "message" => "Falta el campo obligatorio: $field"]);
        exit();
    }
}

// Asignar datos con valores por defecto para campos opcionales
$nombre     = trim($data["nombre_usuario"]);
$apellido   = trim($data["apellido_usuario"]);
$telefono   = trim($data["telefono_usuario"]);
$email      = trim($data["correo_usuario"]);
$direccion1 = isset($data["direccion1_usuario"]) ? trim($data["direccion1_usuario"]) : "";
$direccion2 = isset($data["direccion2_usuario"]) ? trim($data["direccion2_usuario"]) : "";
$ciudad     = isset($data["ciudad_usuario"]) ? trim($data["ciudad_usuario"]) : "";
$pais       = isset($data["pais_usuario"]) ? trim($data["pais_usuario"]) : "";
$password   = $data["contraseña"];
$id_rol     = isset($data["id_rol"]) ? intval($data["id_rol"]) : 2;

// Verificar si el correo ya existe
$sql = "SELECT correo_usuario FROM usuario WHERE correo_usuario = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Este correo ya está registrado"]);
    exit();
}

// Encriptar contraseña
$encryptedPassword = password_hash($password, PASSWORD_BCRYPT);

// Insertar nuevo usuario
$sql = "INSERT INTO usuario (
    nombre_usuario, apellido_usuario, telefono_usuario, correo_usuario, 
    direccion1_usuario, direccion2_usuario, ciudad_usuario, pais_usuario, contraseña, id_rol
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "sssssssssi",
    $nombre, $apellido, $telefono, $email,
    $direccion1, $direccion2, $ciudad, $pais,
    $encryptedPassword, $id_rol
);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Registro exitoso"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al registrar: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
