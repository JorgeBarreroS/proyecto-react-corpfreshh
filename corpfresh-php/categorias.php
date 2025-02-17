<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Incluir el archivo de conexión
include 'conexion.php';

// Crear la consulta SQL para obtener las categorías
$sql = "SELECT id_categoria , nombre_categoria FROM categoria"; // Suponiendo que la tabla se llama "categoria"

// Ejecutar la consulta
$result = $conn->query($sql);

// Verificar si hubo resultados
$categorias = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $categorias[] = $row; // Agregar cada categoría al array
    }
}

// Enviar respuesta en formato JSON
echo json_encode($categorias);
?>
