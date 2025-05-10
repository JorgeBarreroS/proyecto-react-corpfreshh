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

require 'conexiones.php';

try {
    // Obtener la conexión utilizando la clase Conexion
    $conn = Conexion::getConexion();
    
    // Leer y validar el JSON recibido
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['correo_usuario']) || !isset($data['codigo'])) {
        echo json_encode(["success" => false, "message" => "Faltan datos"]);
        exit;
    }

    $correo = $data['correo_usuario'];
    $codigo = $data['codigo'];

    // Verificar código en la tabla codigos_reset
    $sql = "SELECT * FROM codigos_reset 
            WHERE correo_usuario = :correo 
            AND codigo = :codigo 
            AND creado_en >= NOW() - INTERVAL 10 MINUTE";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':correo', $correo, PDO::PARAM_STR);
    $stmt->bindParam(':codigo', $codigo, PDO::PARAM_STR);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        echo json_encode(["success" => true, "message" => "Código válido"]);
    } else {
        echo json_encode(["success" => false, "message" => "Código inválido o expirado"]);
    }
    
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error en la base de datos: " . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>