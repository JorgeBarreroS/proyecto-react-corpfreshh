<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Incluir el archivo de conexión
include 'conexiones.php';

try {
    // Obtener la conexión utilizando la clase Conexion
    $conn = Conexion::getConexion();
    
    // Crear la consulta SQL para obtener las categorías
    $sql = "SELECT id_categoria, nombre_categoria FROM categoria";
    
    // Ejecutar la consulta
    $stmt = $conn->query($sql);
    
    // Obtener resultados
    $categorias = $stmt->fetchAll();
    
    // Enviar respuesta en formato JSON
    echo json_encode($categorias);
    
} catch (PDOException $e) {
    // En caso de error, enviar respuesta de error
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener las categorías: ' . $e->getMessage()
    ]);
}
?>