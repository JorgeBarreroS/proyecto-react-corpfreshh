<?php
// Headers CORS completos
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Manejar solicitud OPTIONS para CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Incluir el archivo de conexión
include 'conexiones.php';

// Función para enviar respuestas de error consistentes
function sendError($message, $code = 500) {
    http_response_code($code);
    die(json_encode([
        'success' => false,
        'message' => $message
    ]));
}

try {
    // Obtener la conexión utilizando la clase Conexion
    $conn = Conexion::getConexion();
    if (!$conn) {
        sendError("Error de conexión a la base de datos");
    }
    
    // Validar parámetros
    $productos_por_pagina = 12;
    $pagina_actual = isset($_GET['pagina']) ? (int)$_GET['pagina'] : 1;
    $categoria = isset($_GET['categoria']) ? (int)$_GET['categoria'] : 0;
    
    if ($pagina_actual < 1) {
        sendError("Número de página inválido", 400);
    }
    
    $offset = ($pagina_actual - 1) * $productos_por_pagina;

    // Consulta base
    $sql = "SELECT p.*, 
                   (SELECT porcentaje_descuento 
                    FROM ofertas_especiales 
                    WHERE (id_producto = p.id_producto OR id_categoria = p.id_categoria OR (id_producto IS NULL AND id_categoria IS NULL))
                    AND activo = 1 
                    AND fecha_inicio <= NOW() 
                    AND fecha_fin >= NOW()
                    ORDER BY 
                        CASE 
                            WHEN id_producto IS NOT NULL THEN 1
                            WHEN id_categoria IS NOT NULL THEN 2
                            ELSE 3
                        END,
                        fecha_fin ASC
                    LIMIT 1) as descuento
            FROM producto p";
    
    // Añadir condición de categoría si es necesario
    if ($categoria > 0) {
        $sql .= " WHERE p.id_categoria = :categoria";
    }
    
    // Añadir límite y offset
    $sql .= " LIMIT :offset, :limit";
    
    // Preparar y ejecutar consulta
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        sendError("Error al preparar la consulta");
    }
    
    if ($categoria > 0) {
        $stmt->bindParam(':categoria', $categoria, PDO::PARAM_INT);
    }
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    $stmt->bindParam(':limit', $productos_por_pagina, PDO::PARAM_INT);
    
    if (!$stmt->execute()) {
        sendError("Error al ejecutar la consulta");
    }
    
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Formatear productos
    $productos_formateados = array_map(function($producto) {
        $precio_con_descuento = null;
        if ($producto['descuento'] && $producto['descuento'] > 0) {
            $precio_con_descuento = round($producto['precio_producto'] * (1 - ($producto['descuento'] / 100)), 2);
        }
        
        return [
            'id_producto' => (int)$producto['id_producto'],
            'nombre_producto' => $producto['nombre_producto'],
            'descripcion_producto' => $producto['descripcion_producto'],
            'precio_producto' => (float)$producto['precio_producto'],
            'precio_con_descuento' => $precio_con_descuento,
            'descuento' => $producto['descuento'] ? (int)$producto['descuento'] : null,
            'imagen_producto' => $producto['imagen_producto'],
            'id_categoria' => (int)$producto['id_categoria'],
            'nombre_marca' => (int)$producto['nombre_marca'],
            'stock' => (int)$producto['stock'],
            'color_producto' => $producto['color_producto'],
            'talla' => $producto['talla']
        ];
    }, $productos);
    
    // Consulta para el total
    $sql_count = "SELECT COUNT(*) as total FROM producto";
    if ($categoria > 0) {
        $sql_count .= " WHERE id_categoria = :categoria";
    }
    
    $stmt_count = $conn->prepare($sql_count);
    if ($categoria > 0) {
        $stmt_count->bindParam(':categoria', $categoria, PDO::PARAM_INT);
    }
    
    if (!$stmt_count->execute()) {
        sendError("Error al contar productos");
    }
    
    $total = (int)$stmt_count->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Respuesta exitosa
    $response = [
        "success" => true,
        "data" => [
            "products" => $productos_formateados,
            "pagination" => [
                "current_page" => $pagina_actual,
                "per_page" => $productos_por_pagina,
                "total" => $total,
                "total_pages" => ceil($total / $productos_por_pagina)
            ]
        ]
    ];
    
    echo json_encode($response);

} catch (PDOException $e) {
    sendError("Error de base de datos: " . $e->getMessage());
} catch (Exception $e) {
    sendError("Error: " . $e->getMessage());
}
?>