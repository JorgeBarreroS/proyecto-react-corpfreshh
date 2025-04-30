<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Incluir el archivo de conexión
include 'conexion.php';

// Inicializar variables con valores predeterminados
$productos_por_pagina = 10; // Número de productos por página
$pagina_actual = isset($_GET['pagina']) ? (int)$_GET['pagina'] : 1; // Página actual (predeterminada: 1)
$categoria = isset($_GET['categoria']) ? (int)$_GET['categoria'] : 0; // Categoría (predeterminada: 0)
$offset = ($pagina_actual - 1) * $productos_por_pagina; // Calcular el desplazamiento para la consulta

// Crear la consulta SQL
if ($categoria > 0) {
    $sql = "SELECT * FROM producto WHERE id_categoria = $categoria LIMIT $offset, $productos_por_pagina";
} else {
    $sql = "SELECT * FROM producto LIMIT $offset, $productos_por_pagina";
}

// Ejecutar la consulta
$result = $conn->query($sql);

// Verificar si hubo resultados
$productos = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $productos[] = $row; // Agregar cada producto al array
    }
}

// Enviar respuesta en formato JSON
echo json_encode([
    "products" => $productos,
    "current_page" => $pagina_actual,
    "total_products" => $result->num_rows,
]);
?>
