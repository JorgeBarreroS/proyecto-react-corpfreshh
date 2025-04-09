<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Incluir archivo de conexión
include 'conexion.php';

// Leer datos JSON del cuerpo del POST
$data = json_decode(file_get_contents("php://input"), true);

// Validar que los datos existan
if (!isset($data["nombre"], $data["email"], $data["mensaje"])) {
    echo json_encode(["status" => "error", "message" => "Faltan campos obligatorios"]);
    exit();
}

// Escapar datos para seguridad
$nombre = $conn->real_escape_string($data["nombre"]);
$email = $conn->real_escape_string($data["email"]);
$mensaje = $conn->real_escape_string($data["mensaje"]);

// Insertar en la base de datos
$sql = "INSERT INTO contactos (nombre, email, mensaje) VALUES ('$nombre', '$email', '$mensaje')";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => $conn->error]);
}

$conn->close();
?>
