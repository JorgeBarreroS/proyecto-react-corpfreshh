<?php
// Encabezados CORS
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Manejo de preflight (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'conexiones.php';

$response = ["success" => false, "message" => "Error al actualizar datos"];

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['email']) || !$data['email']) {
        throw new Exception("Email requerido");
    }

    $currentEmail = $data['email'];
    $newEmail = isset($data['newEmail']) && !empty($data['newEmail']) ? $data['newEmail'] : null;
    $nombre = $data['nombre'] ?? '';
    $apellido = $data['apellido'] ?? '';
    $telefono = $data['telefono'] ?? '';
    $direccion1 = $data['direccion1'] ?? '';
    $direccion2 = $data['direccion2'] ?? '';
    $ciudad = $data['ciudad'] ?? '';
    $pais = $data['pais'] ?? '';
    $correo = $data['correo'] ?? $currentEmail;

    $cnn = Conexion::getConexion();
    
    // Si hay cambio de email, verificar que el nuevo no exista ya
    if ($newEmail && $newEmail !== $currentEmail) {
        $checkEmailStmt = $cnn->prepare("SELECT COUNT(*) FROM usuario WHERE correo_usuario = :email");
        $checkEmailStmt->execute(['email' => $newEmail]);
        $emailExists = (int)$checkEmailStmt->fetchColumn();
        
        if ($emailExists) {
            throw new Exception("El correo electrónico ya está en uso por otro usuario");
        }
    }
    
    // Preparar la consulta SQL
    $sql = "
        UPDATE usuario 
        SET nombre_usuario = :nombre, 
            apellido_usuario = :apellido, 
            telefono_usuario = :telefono, 
            direccion1_usuario = :direccion1,
            direccion2_usuario = :direccion2,
            ciudad_usuario = :ciudad,
            pais_usuario = :pais
    ";
    
    // Si hay cambio de email, incluirlo en la actualización
    if ($newEmail && $newEmail !== $currentEmail) {
        $sql .= ", correo_usuario = :newEmail";
    }
    
    $sql .= " WHERE correo_usuario = :email";
    
    $stmt = $cnn->prepare($sql);
    
    $params = [
        'nombre' => $nombre,
        'apellido' => $apellido,
        'telefono' => $telefono,
        'direccion1' => $direccion1,
        'direccion2' => $direccion2,
        'ciudad' => $ciudad,
        'pais' => $pais,
        'email' => $currentEmail
    ];
    
    // Añadir el nuevo email si existe
    if ($newEmail && $newEmail !== $currentEmail) {
        $params['newEmail'] = $newEmail;
    }
    
    $stmt->execute($params);

    if ($stmt->rowCount() > 0) {
        $response = [
            "success" => true, 
            "message" => "Datos actualizados correctamente",
            "emailChanged" => ($newEmail && $newEmail !== $currentEmail)
        ];
    } else {
        // Verificar si el usuario existe
        $checkStmt = $cnn->prepare("SELECT COUNT(*) FROM usuario WHERE correo_usuario = :email");
        $checkStmt->execute(['email' => $currentEmail]);
        $exists = (int)$checkStmt->fetchColumn();
        
        if ($exists) {
            // El usuario existe pero no se realizaron cambios (mismos datos)
            $response = ["success" => true, "message" => "No se detectaron cambios en los datos"];
        } else {
            throw new Exception("Usuario no encontrado");
        }
    }
} catch (Exception $e) {
    http_response_code(400);
    $response["message"] = $e->getMessage();
}

echo json_encode($response);