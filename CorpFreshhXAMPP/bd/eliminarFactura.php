<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once 'conexion.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->id_factura)) {
    try {
        $query = $pdo->prepare("DELETE FROM facturas WHERE id = :id_factura");
        $query->bindParam(':id_factura', $data->id_factura);
        $query->execute();
        
        if ($query->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Factura eliminada con éxito'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'No se encontró la factura con el ID proporcionado'
            ]);
        }
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Falta el ID de la factura'
    ]);
}