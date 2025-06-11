<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once 'conexion.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->pedido_id) && isset($data->producto_id)) {
    try {
        // Verificar que el pedido existe
        $checkPedido = $pdo->prepare("SELECT id FROM pedidos WHERE id = :pedido_id");
        $checkPedido->bindParam(':pedido_id', $data->pedido_id);
        $checkPedido->execute();

        if ($checkPedido->rowCount() === 0) {
            echo json_encode([
                'success' => false,
                'message' => 'El pedido con ID ' . $data->pedido_id . ' no existe.'
            ]);
            exit;
        }

        // Valores predeterminados o asegurados
        $data->nombre_producto = empty($data->nombre_producto) ? '' : $data->nombre_producto;
        $data->precio_unitario = empty($data->precio_unitario) ? 0.00 : floatval($data->precio_unitario);
        $data->cantidad = empty($data->cantidad) ? 1 : intval($data->cantidad);
        $data->color = empty($data->color) ? '' : $data->color;
        $data->talla = empty($data->talla) ? '' : $data->talla;

        // Calcular subtotal si no está definido
        if (empty($data->subtotal)) {
            $data->subtotal = $data->precio_unitario * $data->cantidad;
        } else {
            $data->subtotal = floatval($data->subtotal);
        }

        // Insertar en pedidos_detalle
        $query = $pdo->prepare("INSERT INTO pedidos_detalle (
            pedido_id, 
            producto_id, 
            nombre_producto, 
            precio_unitario, 
            cantidad, 
            subtotal, 
            color, 
            talla
        ) VALUES (
            :pedido_id, 
            :producto_id, 
            :nombre_producto, 
            :precio_unitario, 
            :cantidad, 
            :subtotal, 
            :color, 
            :talla
        )");

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
            'message' => 'Detalle de pedido agregado correctamente.'
        ]);

    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error en la base de datos: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Datos incompletos. Se requieren pedido_id y producto_id.'
    ]);
}
