<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once 'conexion.php';
require_once 'encryption.php'; // Importar el archivo de encriptación

$data = json_decode(file_get_contents("php://input"));

// Verificamos que existan todos los campos necesarios
if (isset($data->id_usuario)) {
    try {
        // Base query without password
        $sql = "UPDATE usuario SET 
            nombre_usuario = :nombre_usuario, 
            apellido_usuario = :apellido_usuario,
            telefono_usuario = :telefono_usuario,
            correo_usuario = :correo_usuario,
            direccion1_usuario = :direccion1_usuario,
            direccion2_usuario = :direccion2_usuario,
            ciudad_usuario = :ciudad_usuario,
            pais_usuario = :pais_usuario,
            id_rol = :id_rol";
        
        // If password is provided, update it too
        if (isset($data->contrasena) && !empty($data->contrasena)) {
            $sql .= ", contraseña = :contrasena";
        }
        
        $sql .= " WHERE id_usuario = :id_usuario";
        
        $query = $pdo->prepare($sql);
            
        $query->bindParam(':id_usuario', $data->id_usuario);
        $query->bindParam(':nombre_usuario', $data->nombre_usuario);
        $query->bindParam(':apellido_usuario', $data->apellido_usuario);
        $query->bindParam(':telefono_usuario', $data->telefono_usuario);
        $query->bindParam(':correo_usuario', $data->correo_usuario);
        $query->bindParam(':direccion1_usuario', $data->direccion1_usuario);
        $query->bindParam(':direccion2_usuario', $data->direccion2_usuario);
        $query->bindParam(':ciudad_usuario', $data->ciudad_usuario);
        $query->bindParam(':pais_usuario', $data->pais_usuario);
        $query->bindParam(':id_rol', $data->id_rol);
        
        // Bind password if provided
        if (isset($data->contrasena) && !empty($data->contrasena)) {
            $encrypted_password = encryptPassword($data->contrasena);
            $query->bindParam(':contrasena', $encrypted_password);
        }
        
        $query->execute();

        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
}
?>