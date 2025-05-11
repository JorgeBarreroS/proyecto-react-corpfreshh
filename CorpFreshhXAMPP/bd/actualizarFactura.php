<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once 'conexion.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->id)) {
    try {
        $query = $pdo->prepare("UPDATE facturas SET 
            pedido_id = :pedido_id,
            correo_usuario = :correo_usuario, 
            id_usuario = :id_usuario, 
            fecha_factura = :fecha_factura, 
            subtotal = :subtotal,
            envio = :envio,
            impuestos = :impuestos, 
            total = :total, 
            metodo_pago = :metodo_pago
            WHERE id = :id");

        $query->bindParam(':id', $data->id);
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

        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Faltan parámetros requeridos']);
}