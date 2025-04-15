<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: http://localhost:3000"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'conexion.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->id_categoria)) {
    try {
        // Primero verificar si hay productos asociados a esta categoría
        $sql_check = "SELECT COUNT(*) FROM producto WHERE id_categoria = :id_categoria";
        $stmt_check = $pdo->prepare($sql_check);
        $stmt_check->bindParam(':id_categoria', $data->id_categoria);
        $stmt_check->execute();
        $productosAsociados = $stmt_check->fetchColumn();

        if ($productosAsociados > 0) {
            echo json_encode([
                'success' => false,
                'message' => 'No se puede eliminar la categoría porque tiene productos asociados.'
            ]);
            exit();
        }

        // Si no tiene productos asociados, eliminar la categoría
        $sql = "DELETE FROM categoria WHERE id_categoria = :id_categoria";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':id_categoria', $data->id_categoria);

        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Error al eliminar la categoría'
            ]);
        }

    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error de base de datos: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'ID de categoría no proporcionado'
    ]);
}
?>
