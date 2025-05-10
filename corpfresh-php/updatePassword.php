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
require 'encryption.php';

try {
    // Obtener la conexión utilizando la clase Conexion
    $conn = Conexion::getConexion();
    
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data || !isset($data['correo_usuario'], $data['nueva_contrasena'], $data['codigo'])) {
        echo json_encode(["success" => false, "message" => "Campos faltantes"]);
        exit();
    }

    $correo = $data['correo_usuario'];
    $nueva = $data['nueva_contrasena'];
    $codigo = $data['codigo'];

    // Verificar que el código sea válido y no haya expirado
    $sql = "SELECT * FROM codigos_reset 
            WHERE correo_usuario = :correo 
            AND codigo = :codigo 
            AND creado_en >= NOW() - INTERVAL 10 MINUTE";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':correo', $correo, PDO::PARAM_STR);
    $stmt->bindParam(':codigo', $codigo, PDO::PARAM_STR);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        echo json_encode(["success" => false, "message" => "Código inválido o expirado"]);
        exit();
    }

    // Obtener el ID del usuario
    $sql = "SELECT id_usuario FROM usuario WHERE correo_usuario = :correo";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':correo', $correo, PDO::PARAM_STR);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
        exit();
    }

    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    $id_usuario = $usuario['id_usuario'];

    // Encriptar la nueva contraseña
    $nueva_cifrada = encryptPassword($nueva);

    // Actualizar la contraseña
    $sql = "UPDATE usuario SET contraseña = :nueva WHERE id_usuario = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':nueva', $nueva_cifrada, PDO::PARAM_STR);
    $stmt->bindParam(':id', $id_usuario, PDO::PARAM_INT);
    $stmt->execute();

    // Eliminar los códigos utilizados
    $sql = "DELETE FROM codigos_reset WHERE correo_usuario = :correo";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':correo', $correo, PDO::PARAM_STR);
    $stmt->execute();

    echo json_encode(["success" => true, "message" => "Contraseña actualizada"]);
    
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error en la base de datos: " . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>