<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: http://localhost:3000"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once 'conexion.php';

// Obtener los datos enviados en el cuerpo de la solicitud
$data = json_decode(file_get_contents("php://input"));

if (isset($data->id_producto)) {
    // Consulta para actualizar el producto
    $sql = "UPDATE producto SET 
            nombre_producto = :nombre_producto,
            descripcion_producto = :descripcion_producto,
            color_producto = :color_producto,
            precio_producto = :precio_producto,
            imagen_producto = :imagen_producto,
            nombre_marca = :nombre_marca,
            talla = :talla,
            stock = :stock,
            id_categoria = :id_categoria
            WHERE id_producto = :id_producto";

    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':id_producto', $data->id_producto);
    $stmt->bindParam(':nombre_producto', $data->nombre_producto);
    $stmt->bindParam(':descripcion_producto', $data->descripcion_producto);
    $stmt->bindParam(':color_producto', $data->color_producto);
    $stmt->bindParam(':precio_producto', $data->precio_producto);
    $stmt->bindParam(':imagen_producto', $data->imagen_producto);
    $stmt->bindParam(':nombre_marca', $data->nombre_marca);
    $stmt->bindParam(':talla', $data->talla);
    $stmt->bindParam(':stock', $data->stock);
    $stmt->bindParam(':id_categoria', $data->id_categoria);

    // Ejecutar la consulta
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false]);
    }
} else {
    // Respuesta en caso de que no se proporcione un ID de producto válido
    echo json_encode(['success' => false, 'message' => 'ID de producto no proporcionado']);
}
?>