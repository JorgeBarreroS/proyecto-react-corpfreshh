<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require 'conexion.php';

$data = json_decode(file_get_contents("php://input"), true);

// Validar campos requeridos
$required_fields = [
    "nombre_usuario", "apellido_usuario", "telefono_usuario",
    "correo_usuario", "direccion1_usuario", "direccion2_usuario",
    "ciudad_usuario", "pais_usuario", "contraseña"
];

foreach ($required_fields as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        echo json_encode(["success" => false, "message" => "Falta el campo: $field"]);
        exit();
    }
}

// Asignar datos
$nombre = $data["nombre_usuario"];
$apellido = $data["apellido_usuario"];
$telefono = $data["telefono_usuario"];
$email = $data["correo_usuario"];
$direccion1 = $data["direccion1_usuario"];
$direccion2 = $data["direccion2_usuario"];
$ciudad = $data["ciudad_usuario"];
$pais = $data["pais_usuario"];
$password = $data["contraseña"];

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

$id_rol = 2;

// Insertar nuevo usuario (rol fijo 2)
$sql = "INSERT INTO usuario (
    nombre_usuario, apellido_usuario, telefono_usuario, correo_usuario, 
    direccion1_usuario, direccion2_usuario, ciudad_usuario, pais_usuario, contraseña, id_rol
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "sssssssssi", // 9 strings + 1 entero (id_rol)
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
