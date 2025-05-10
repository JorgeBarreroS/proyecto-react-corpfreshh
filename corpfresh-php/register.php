<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require 'conexiones.php';
require 'encryption.php';

try {
    // Obtener la conexión utilizando la clase Conexion
    $conn = Conexion::getConexion();

    $data = json_decode(file_get_contents("php://input"), true);

    $required_fields = [
        "nombre_usuario", "apellido_usuario", "telefono_usuario",
        "correo_usuario", "contraseña"
    ];

    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            echo json_encode(["success" => false, "message" => "Falta el campo obligatorio: $field"]);
            exit();
        }
    }

    $nombre     = trim($data["nombre_usuario"]);
    $apellido   = trim($data["apellido_usuario"]);
    $telefono   = trim($data["telefono_usuario"]);
    $email      = trim($data["correo_usuario"]);
    $direccion1 = isset($data["direccion1_usuario"]) ? trim($data["direccion1_usuario"]) : "";
    $direccion2 = isset($data["direccion2_usuario"]) ? trim($data["direccion2_usuario"]) : "";
    $ciudad     = isset($data["ciudad_usuario"]) ? trim($data["ciudad_usuario"]) : "";
    $pais       = isset($data["pais_usuario"]) ? trim($data["pais_usuario"]) : "";
    $password   = $data["contraseña"];
    $id_rol     = isset($data["id_rol"]) ? intval($data["id_rol"]) : 2;

    // Verificar si el correo ya existe
    $sql = "SELECT correo_usuario FROM usuario WHERE correo_usuario = :email";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(":email", $email, PDO::PARAM_STR);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        echo json_encode(["success" => false, "message" => "Este correo ya está registrado"]);
        exit();
    }

    $encryptedPassword = encryptPassword($password);

    // Insertar el nuevo usuario
    $sql = "INSERT INTO usuario (
        nombre_usuario, apellido_usuario, telefono_usuario, correo_usuario, 
        direccion1_usuario, direccion2_usuario, ciudad_usuario, pais_usuario, contraseña, id_rol
    ) VALUES (:nombre, :apellido, :telefono, :email, :dir1, :dir2, :ciudad, :pais, :pass, :rol)";

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(":nombre", $nombre, PDO::PARAM_STR);
    $stmt->bindParam(":apellido", $apellido, PDO::PARAM_STR);
    $stmt->bindParam(":telefono", $telefono, PDO::PARAM_STR);
    $stmt->bindParam(":email", $email, PDO::PARAM_STR);
    $stmt->bindParam(":dir1", $direccion1, PDO::PARAM_STR);
    $stmt->bindParam(":dir2", $direccion2, PDO::PARAM_STR);
    $stmt->bindParam(":ciudad", $ciudad, PDO::PARAM_STR);
    $stmt->bindParam(":pais", $pais, PDO::PARAM_STR);
    $stmt->bindParam(":pass", $encryptedPassword, PDO::PARAM_STR);
    $stmt->bindParam(":rol", $id_rol, PDO::PARAM_INT);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Registro exitoso"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error al registrar"]);
    }

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error en la base de datos: " . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>