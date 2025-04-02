<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once 'conexion.php';

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['id_venta'])) {
    $id_venta = $data['id_venta'];
    $fecha_venta = $data['fecha_venta'];
    $impuesto_venta = $data['impuesto_venta'];
    $total_venta = $data['total_venta'];
    $estado_venta = $data['estado_venta'];
    $id_usuario = $data['id_usuario'];

    try {
        $query = "UPDATE ordenes SET 
            fecha_venta = :fecha_venta,
            impuesto_venta = :impuesto_venta,
            total_venta = :total_venta,
            estado_venta = :estado_venta,
            id_usuario = :id_usuario
            WHERE id_venta = :id_venta";
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':id_venta', $id_venta);
        $stmt->bindParam(':fecha_venta', $fecha_venta);
        $stmt->bindParam(':impuesto_venta', $impuesto_venta);
        $stmt->bindParam(':total_venta', $total_venta);
        $stmt->bindParam(':estado_venta', $estado_venta);
        $stmt->bindParam(':id_usuario', $id_usuario);
        $stmt->execute();

        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['error' => 'Datos incompletos']);
}
