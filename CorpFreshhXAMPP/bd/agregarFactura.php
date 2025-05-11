<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once 'conexion.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->correo_usuario) && isset($data->id_usuario)) {
    try {
        // Set default values if not provided
        $data->pedido_id = empty($data->pedido_id) ? null : $data->pedido_id;
        $data->fecha_factura = empty($data->fecha_factura) ? date('Y-m-d') : $data->fecha_factura;
        $data->subtotal = empty($data->subtotal) ? 0.00 : floatval($data->subtotal);
        $data->envio = empty($data->envio) ? 0.00 : floatval($data->envio);
        $data->impuestos = empty($data->impuestos) ? 0.00 : floatval($data->impuestos);
        $data->total = empty($data->total) ? 0.00 : floatval($data->total);
        $data->metodo_pago = empty($data->metodo_pago) ? 'Efectivo' : $data->metodo_pago;
        
        $query = $pdo->prepare("INSERT INTO facturas (
            pedido_id,
            correo_usuario, 
            id_usuario, 
            fecha_factura, 
            subtotal,
            envio,
            impuestos, 
            total, 
            metodo_pago
        ) VALUES (
            :pedido_id,
            :correo_usuario, 
            :id_usuario, 
            :fecha_factura, 
            :subtotal,
            :envio,
            :impuestos, 
            :total, 
            :metodo_pago
        )");
        
        $query->bindParam(':pedido_id', $data->pedido_id);
        $query->bindParam(':correo_usuario', $data->correo_usuario);
        $query->bindParam(':id_usuario', $data->id_usuario);
        $query->bindParam(':fecha_factura', $data->fecha_factura);
        $query->bindParam(':subtotal', $data->subtotal);
        $query->bindParam(':envio', $data->envio);
        $query->bindParam(':impuestos', $data->impuestos);
        $query->bindParam(':total', $data->total);
        $query->bindParam(':metodo_pago', $data->metodo_pago);
        
        $query->execute();
        
        $id_factura = $pdo->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'id_factura' => $id_factura,
            'message' => 'Factura creada con éxito'
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
        'message' => 'Faltan datos requeridos. Se necesita correo e ID de usuario.'
    ]);
}