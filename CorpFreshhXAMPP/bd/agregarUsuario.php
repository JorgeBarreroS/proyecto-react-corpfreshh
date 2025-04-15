<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once 'conexion.php';
require_once 'encryption.php'; // Importar el archivo de encriptación

$data = json_decode(file_get_contents("php://input"));

if (isset($data->nombre_usuario) && isset($data->correo_usuario) && isset($data->contrasena)) {
    try {
        // Verificar si el correo ya existe
        $checkEmail = $pdo->prepare("SELECT COUNT(*) FROM usuario WHERE correo_usuario = :correo_usuario");
        $checkEmail->bindParam(':correo_usuario', $data->correo_usuario);
        $checkEmail->execute();
        
        if ($checkEmail->fetchColumn() > 0) {
            echo json_encode(['success' => false, 'message' => 'Este correo ya está registrado']);
            exit;
        }
        
        // Usar el método de encriptación consistente
        $encrypted_password = encryptPassword($data->contrasena);
        
        $query = $pdo->prepare("INSERT INTO usuario (
            nombre_usuario, 
            apellido_usuario,
            telefono_usuario,
            correo_usuario,
            direccion1_usuario,
            direccion2_usuario,
            ciudad_usuario,
            pais_usuario,
            contraseña, 
            id_rol
        ) VALUES (
            :nombre_usuario, 
            :apellido_usuario,
            :telefono_usuario,
            :correo_usuario,
            :direccion1_usuario,
            :direccion2_usuario,
            :ciudad_usuario,
            :pais_usuario,
            :contrasena,
            :id_rol
        )");
        
        $query->bindParam(':nombre_usuario', $data->nombre_usuario);
        $query->bindParam(':apellido_usuario', $data->apellido_usuario);
        $query->bindParam(':telefono_usuario', $data->telefono_usuario);
        $query->bindParam(':correo_usuario', $data->correo_usuario);
        $query->bindParam(':direccion1_usuario', $data->direccion1_usuario);
        $query->bindParam(':direccion2_usuario', $data->direccion2_usuario);
        $query->bindParam(':ciudad_usuario', $data->ciudad_usuario);
        $query->bindParam(':pais_usuario', $data->pais_usuario);
        $query->bindParam(':contrasena', $encrypted_password);
        $query->bindParam(':id_rol', $data->id_rol);
        
        $query->execute();
        $id_usuario = $pdo->lastInsertId();

        echo json_encode(['success' => true, 'id_usuario' => $id_usuario]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos']);
}
?>