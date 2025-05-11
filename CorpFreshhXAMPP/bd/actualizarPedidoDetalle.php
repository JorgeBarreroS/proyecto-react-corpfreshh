<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once 'conexion.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->id)) {
    try {
        // Verificar que el pedido_id y producto_id existan
        if (empty($data->pedido_id) || empty($data->producto_id)) {
            echo json_encode([
                'success' => false,
                'message' => 'El ID del pedido y el ID del producto son obligatorios'
            ]);
            exit;
        }
        
        // Calcular el subtotal si no está definido
        if (!isset($data->subtotal) && isset($data->precio_unitario) && isset($data->cantidad)) {
            $data->subtotal = floatval($data->precio_unitario) * intval($data->cantidad);
        }

        $query = $pdo->prepare("UPDATE pedidos_detalle SET 
            pedido_id = :pedido_id, 
            producto_id = :producto_id, 
            nombre_producto = :nombre_producto, 
            precio_unitario = :precio_unitario, 
            cantidad = :cantidad, 
            subtotal = :subtotal, 
            color = :color, 
            talla = :talla 
            WHERE id = :id");

        $query->bindParam(':id', $data->id);
        $query->bindParam(':pedido_id', $data->pedido_id);
        $query->bindParam(':producto_id', $data->producto_id);
        $query->bindParam(':nombre_producto', $data->nombre_producto);
        $query->bindParam(':precio_unitario', $data->precio_unitario);
        $query->bindParam(':cantidad', $data->cantidad);
        $query->bindParam(':subtotal', $data->subtotal);
        $query->bindParam(':color', $data->color);
        $query->bindParam(':talla', $data->talla);
        
        $query->execute();

        echo json_encode([
            'success' => true,
            'message' => 'Detalle de pedido actualizado correctamente'
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Falta el ID del detalle de pedido'
    ]);
}