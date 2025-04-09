<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

error_reporting(E_ALL);
ini_set('display_errors', 1);

require 'cone444.php';
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

// Verificar si el correo existe
$verificarSql = "SELECT id_usuario FROM usuario WHERE correo_usuario = ?";
$verificarStmt = $conexion->prepare($verificarSql);
$verificarStmt->bind_param("s", $email);
$verificarStmt->execute();
$verificarStmt->store_result();

if ($verificarStmt->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Este correo no está registrado."]);
    exit;
}

// Guardar código
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
    $mail->Username = '';
    $mail->Password = ''; // Reemplaza por tu clave real
    $mail->SMTPSecure = 'ssl';
    $mail->Port = 465;

    $mail->setFrom('', 'Corpfreshh');
    $mail->addAddress($email);
    $mail->isHTML(true);
    $mail->Subject = 'Recuperación de contraseña - Corpfreshh';

    $mail->Body = "
    <div style='font-family: Arial, sans-serif; color: #333; padding: 20px;'>
        <h2 style='color: #0066cc;'>Solicitud de recuperación de contraseña</h2>
        <p>Hola,</p>
        <p>Hemos recibido una solicitud para restablecer tu contraseña asociada a este correo electrónico.</p>
        <p>Tu código de verificación es:</p>
        <div style='font-size: 24px; font-weight: bold; margin: 20px 0; color: #0066cc;'>$codigo</div>
        <p>Este código estará vigente por 10 minutos. Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
        <br>
        <p>Gracias,<br><strong>El equipo de Corpfreshh</strong></p>
        <hr style='margin-top: 30px;'>
        <small style='color: #888;'>Este correo fue generado automáticamente. Por favor, no respondas a este mensaje.</small>
    </div>
    ";

    $mail->AltBody = "Tu código de recuperación es: $codigo. Válido por 10 minutos. Si no lo solicitaste, ignora este mensaje.";

    $mail->send();

    echo json_encode(["success" => true, "message" => "Código enviado con éxito"]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error al enviar el correo: " . $mail->ErrorInfo]);
}
