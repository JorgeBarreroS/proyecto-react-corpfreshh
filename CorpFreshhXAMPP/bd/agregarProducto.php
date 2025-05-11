<?php
header("Access-Control-Allow-Origin: http://localhost:3000"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Manejar solicitudes OPTIONS (pre-flight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Luego configura el reporte de errores
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once 'conexion.php';

// Obtener los datos enviados en el cuerpo de la solicitud
$data = json_decode(file_get_contents("php://input"));

if (isset($data->nombre_producto) && isset($data->precio_producto)) {
    // Consulta para insertar un nuevo producto
    $sql = "INSERT INTO producto (
                nombre_producto, 
                descripcion_producto, 
                color_producto, 
                precio_producto, 
                imagen_producto, 
                nombre_marca, 
                talla,
                stock,
                id_categoria
            ) VALUES (
                :nombre_producto,
                :descripcion_producto,
                :color_producto,
                :precio_producto,
                :imagen_producto,
                :nombre_marca,
                :talla,
                :stock,
                :id_categoria
            )";

    $stmt = $pdo->prepare($sql);
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
        $id_producto = $pdo->lastInsertId();
        echo json_encode([
            'success' => true, 
            'message' => 'Producto agregado correctamente',
            'id_producto' => $id_producto
        ]);
    } else {
        echo json_encode([
            'success' => false, 
            'message' => 'Error al agregar el producto'
        ]);
    }
} else {
    // Respuesta en caso de que no se proporcionen los datos requeridos
    echo json_encode([
        'success' => false, 
        'message' => 'Datos incompletos. Se requiere al menos nombre y precio del producto.'
    ]);
}
?>