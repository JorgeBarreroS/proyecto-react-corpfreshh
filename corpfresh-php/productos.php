<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Incluir el archivo de conexión
include 'conexiones.php';

try {
    // Obtener la conexión utilizando la clase Conexion
    $conn = Conexion::getConexion();
    
    // Inicializar variables con valores predeterminados
    $productos_por_pagina = 12; // Número de productos por página
    $pagina_actual = isset($_GET['pagina']) ? (int)$_GET['pagina'] : 1; // Página actual (predeterminada: 1)
    $categoria = isset($_GET['categoria']) ? (int)$_GET['categoria'] : 0; // Categoría (predeterminada: 0)
    $offset = ($pagina_actual - 1) * $productos_por_pagina; // Calcular el desplazamiento para la consulta
    
    // Crear la consulta SQL con parámetros preparados
    if ($categoria > 0) {
        $sql = "SELECT * FROM producto WHERE id_categoria = :categoria LIMIT :offset, :limit";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':categoria', $categoria, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->bindParam(':limit', $productos_por_pagina, PDO::PARAM_INT);
    } else {
        $sql = "SELECT * FROM producto LIMIT :offset, :limit";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->bindParam(':limit', $productos_por_pagina, PDO::PARAM_INT);
    }
    
    // Ejecutar la consulta
    $stmt->execute();
    $productos = $stmt->fetchAll();
    
    // Obtener el total de productos para la paginación
    if ($categoria > 0) {
        $sql_count = "SELECT COUNT(*) as total FROM producto WHERE id_categoria = :categoria";
        $stmt_count = $conn->prepare($sql_count);
        $stmt_count->bindParam(':categoria', $categoria, PDO::PARAM_INT);
    } else {
        $sql_count = "SELECT COUNT(*) as total FROM producto";
        $stmt_count = $conn->prepare($sql_count);
    }
    
    $stmt_count->execute();
    $total = $stmt_count->fetch()->total;
    
    // Enviar respuesta en formato JSON
    echo json_encode([
        "products" => $productos,
        "current_page" => $pagina_actual,
        "total_products" => count($productos),
        "total_all" => $total
    ]);

} catch (PDOException $e) {
    // En caso de error, enviar respuesta de error
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener los productos: ' . $e->getMessage()
    ]);
}
?>