<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Incluir el archivo de conexión
include 'conexion.php';

// Obtener ID del producto
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id <= 0) {
    echo json_encode(["error" => "ID de producto inválido"]);
    exit;
}

// Consulta para obtener el producto
$sql = "SELECT p.id_producto, p.nombre_producto, p.descripcion_producto, 
               p.precio_producto, p.imagen_producto, p.color_producto, 
               p.nombre_marca, p.talla 
        FROM producto p
        WHERE p.id_producto = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode($result->fetch_assoc());
} else {
    echo json_encode(["error" => "Producto no encontrado"]);
}

$stmt->close();
$conn->close();
?>
