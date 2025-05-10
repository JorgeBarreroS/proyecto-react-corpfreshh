<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

// Manejar solicitudes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Incluir archivo de conexión
include 'conexiones.php';

try {
    // Obtener la conexión utilizando la clase Conexion
    $conn = Conexion::getConexion();
    
    // Leer datos JSON del cuerpo del POST
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Validar que los datos existan
    if (!isset($data["nombre"], $data["email"], $data["mensaje"])) {
        echo json_encode(["status" => "error", "message" => "Faltan campos obligatorios"]);
        exit();
    }
    
    // Preparar la consulta con parámetros para mayor seguridad
    $sql = "INSERT INTO contactos (nombre, email, mensaje) VALUES (:nombre, :email, :mensaje)";
    $stmt = $conn->prepare($sql);
    
    // Vincular parámetros
    $stmt->bindParam(':nombre', $data["nombre"], PDO::PARAM_STR);
    $stmt->bindParam(':email', $data["email"], PDO::PARAM_STR);
    $stmt->bindParam(':mensaje', $data["mensaje"], PDO::PARAM_STR);
    
    // Ejecutar la consulta
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Contacto guardado correctamente"]);
    } else {
        throw new Exception("Error al guardar el contacto");
    }
    
} catch (PDOException $e) {
    // En caso de error, enviar respuesta de error
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => "Error en la base de datos: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    // Otros errores
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => $e->getMessage()
    ]);
}
?>