<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include_once '../conexion.php';

try {
    // Validar parámetro id_producto
    $id_producto = isset($_GET['id_producto']) ? (int)$_GET['id_producto'] : 0;
    
    if ($id_producto <= 0) {
        echo json_encode(['success' => false, 'message' => 'ID de producto no válido']);
        exit;
    }

    // Paso 1: Buscar ofertas específicas para este producto
    $sql_producto = "SELECT * FROM ofertas_especiales 
                    WHERE activo = '1' 
                    AND fecha_inicio <= NOW() 
                    AND fecha_fin >= NOW()
                    AND id_producto = :id_producto
                    LIMIT 1";
    
    $stmt_producto = $pdo->prepare($sql_producto);
    $stmt_producto->bindParam(':id_producto', $id_producto, PDO::PARAM_INT);
    $stmt_producto->execute();
    $oferta = $stmt_producto->fetch(PDO::FETCH_ASSOC);

    // Si no hay oferta específica, buscar ofertas para la categoría del producto
    if (!$oferta) {
        // Obtener la categoría del producto
        $sql_categoria = "SELECT id_categoria FROM producto WHERE id_producto = :id_producto";
        $stmt_categoria = $pdo->prepare($sql_categoria);
        $stmt_categoria->bindParam(':id_producto', $id_producto, PDO::PARAM_INT);
        $stmt_categoria->execute();
        $producto_data = $stmt_categoria->fetch(PDO::FETCH_ASSOC);
        
        if ($producto_data && $producto_data['id_categoria']) {
            $id_categoria = $producto_data['id_categoria'];
            
            $sql_categoria = "SELECT * FROM ofertas_especiales 
                             WHERE activo = '1' 
                             AND fecha_inicio <= NOW() 
                             AND fecha_fin >= NOW()
                             AND id_categoria = :id_categoria
                             LIMIT 1";
            
            $stmt_categoria = $pdo->prepare($sql_categoria);
            $stmt_categoria->bindParam(':id_categoria', $id_categoria, PDO::PARAM_INT);
            $stmt_categoria->execute();
            $oferta = $stmt_categoria->fetch(PDO::FETCH_ASSOC);
        }
    }

    // Si no hay oferta ni por producto ni por categoría, buscar ofertas generales
    if (!$oferta) {
        $sql_general = "SELECT * FROM ofertas_especiales 
                       WHERE activo = '1' 
                       AND fecha_inicio <= NOW() 
                       AND fecha_fin >= NOW()
                       AND id_producto IS NULL
                       AND id_categoria IS NULL
                       LIMIT 1";
        
        $stmt_general = $pdo->query($sql_general);
        $oferta = $stmt_general->fetch(PDO::FETCH_ASSOC);
    }

    if ($oferta) {
        $response = [
            'success' => true,
            'data' => $oferta
        ];
    } else {
        $response = ['success' => false, 'message' => 'No hay ofertas activas para este producto'];
    }

    echo json_encode($response);

} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error de base de datos: ' . $e->getMessage()
    ]);
}