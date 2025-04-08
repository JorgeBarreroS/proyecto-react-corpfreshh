<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

error_reporting(E_ALL);
ini_set('display_errors', 1);

require 'cone444.php'; // Asegúrate que este archivo tenga la función conectar()
$conexion = conectar();

session_start();

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/Exception.php';
require 'PHPMailer/SMTP.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['email']) || empty($data['email'])) {
    echo json_encode(["success" => false, "message" => "El campo 'email' es obligatorio"]);
    exit;
}

$email = $data['email'];
$codigo = rand(100000, 999999);

$verificarSql = "SELECT id_usuario FROM usuario WHERE correo_usuario = ?";
$verificarStmt = $conexion->prepare($verificarSql);
$verificarStmt->bind_param("s", $email);
$verificarStmt->execute();
$verificarStmt->store_result();

if ($verificarStmt->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Este correo no está registrado."]);
    exit;
}

$sql = "INSERT INTO codigos_reset (correo_usuario, codigo, creado_en) VALUES (?, ?, NOW())";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("ss", $email, $codigo);

if (!$stmt->execute()) {
    echo json_encode(["success" => false, "message" => "Error al guardar el código en la base de datos"]);
    exit;
}

try {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'Corpfreshh@gmail.com';
    $mail->Password = 'oudwyctdqesaxjaz'; // Reemplaza por tu clave de aplicación real
    $mail->SMTPSecure = 'ssl';
    $mail->Port = 465;

    $mail->setFrom('Corpfreshh@gmail.com', 'Corpfreshh');
    $mail->addAddress($email);
    $mail->Subject = 'Código de verificación';
    $mail->Body = "Tu código de recuperación es: $codigo";

    $mail->send();

    echo json_encode(["success" => true, "message" => "Código enviado con éxito"]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error al enviar el correo: " . $mail->ErrorInfo]);
}
