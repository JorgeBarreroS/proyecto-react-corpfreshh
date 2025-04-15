<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once 'conexion.php';

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['id_venta'])) {
    $id_venta = $data['id_venta'];

    try {
        // Primero verifica si hay detalles de orden relacionados
        $checkQuery = "SELECT COUNT(*) FROM ordenes WHERE id_venta = :id_venta";
        $checkStmt = $pdo->prepare($checkQuery);
        $checkStmt->bindParam(':id_venta', $id_venta);
        $checkStmt->execute();
        $hasDetails = $checkStmt->fetchColumn() > 0;

        // Si hay detalles, primero elimínalos
        if ($hasDetails) {
            $deleteDetailsQuery = "DELETE FROM ordenes WHERE id_venta = :id_venta";
            $deleteDetailsStmt = $pdo->prepare($deleteDetailsQuery);
            $deleteDetailsStmt->bindParam(':id_venta', $id_venta);
            $deleteDetailsStmt->execute();
        }

        // Ahora elimina la orden
        $query = "DELETE FROM ordenes WHERE id_venta = :id_venta";
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':id_venta', $id_venta);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'No se encontró la orden']);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'ID de orden no proporcionado']);
}