<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once 'conexion.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->id_pedido)) {
    try {
        $query = $pdo->prepare("UPDATE pedido SET id_venta = :id_venta, id_usuario = :id_usuario, fecha_pedido = :fecha_pedido, estado_pedido = :estado_pedido, metodo_envio_pedido = :metodo_envio_pedido WHERE id_pedido = :id_pedido");
        $query->bindParam(':id_pedido', $data->id_pedido);
        $query->bindParam(':id_venta', $data->id_venta);
        $query->bindParam(':id_usuario', $data->id_usuario);
        $query->bindParam(':fecha_pedido', $data->fecha_pedido);
        $query->bindParam(':estado_pedido', $data->estado_pedido);
        $query->bindParam(':metodo_envio_pedido', $data->metodo_envio_pedido);
        $query->execute();

        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['error' => 'Faltan parámetros']);
}
