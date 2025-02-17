<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require 'conexion.php';  // Asegúrate de que la ruta sea correcta

// Capturar datos enviados por el frontend
$data = json_decode(file_get_contents("php://input"), true);
file_put_contents("debug.txt", print_r($data, true));


// Validar si se reciben todos los datos
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

// Extraer los datos
$nombre = $data["nombre_usuario"];
$apellido = $data["apellido_usuario"];
$telefono = $data["telefono_usuario"];
$email = $data["correo_usuario"];
$direccion1 = $data["direccion1_usuario"];
$direccion2 = $data["direccion2_usuario"];
$ciudad = $data["ciudad_usuario"];
$pais = $data["pais_usuario"];
$password = $data["contraseña"];

// Validar si el correo ya está registrado
$sql = "SELECT correo_usuario FROM usuario WHERE correo_usuario = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Este correo ya está registrado"]);
    exit();
}

// Encriptar la contraseña
$encryptedPassword = password_hash($password, PASSWORD_BCRYPT);

// Insertar el nuevo usuario en la base de datos
$sql = "INSERT INTO usuario (
Textos completos
id_usuario, nombre_usuario, apellido_usuario, telefono_usuario, correo_usuario, direccion1_usuario, direccion2_usuario, ciudad_usuario, pais_usuario, contraseña, id_rol) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sssssssss", $nombre, $apellido, $telefono, $email, $direccion1, $direccion2, $ciudad, $pais, $encryptedPassword);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Registro exitoso"]);
} else {
    echo json_encode(["success" => false, "message" => "Hubo un error en el registro: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
