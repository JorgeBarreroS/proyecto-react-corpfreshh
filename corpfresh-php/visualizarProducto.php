<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Incluir el archivo de conexión
include 'conexiones.php';

try {
    // Obtener la conexión utilizando la clase Conexion
    $conn = Conexion::getConexion();
    
    // Obtener ID del producto
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if ($id <= 0) {
        echo json_encode(["error" => "ID de producto inválido"]);
        exit;
    }
    
    // Consulta para obtener el producto
    $sql = "SELECT p.id_producto, p.nombre_producto, p.descripcion_producto, 
                   p.precio_producto, p.imagen_producto, p.color_producto, 
                   p.nombre_marca, p.talla, p.stock 
            FROM producto p
            WHERE p.id_producto = :id";
    
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    
    $producto = $stmt->fetch();
    
    if ($producto) {
        echo json_encode($producto);
    } else {
        echo json_encode(["error" => "Producto no encontrado"]);
    }

} catch (PDOException $e) {
    // En caso de error, enviar respuesta de error
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener el producto: ' . $e->getMessage()
    ]);
}
?>