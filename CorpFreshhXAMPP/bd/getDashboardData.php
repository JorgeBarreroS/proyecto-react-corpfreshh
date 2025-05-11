<?php


header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
// Incluir la conexión PDO
include 'conexion.php'; // Asegúrate que la ruta sea correcta respecto a donde está este archivo

// Inicializar el array de respuesta
$data = [
    "producto" => [],
    "pedidos" => [],
    "usuario" => 0
];

try {
    // Consulta 1: Productos por categoría
    $stmt1 = $pdo->query("
        SELECT c.nombre_categoria AS categoria, COUNT(p.id_producto) AS total 
        FROM producto p 
        JOIN categoria c ON p.id_categoria = c.id_categoria 
        GROUP BY c.nombre_categoria
    ");
    $data["producto"] = $stmt1->fetchAll(PDO::FETCH_ASSOC);

    // Consulta 2: Órdenes por mes
    $stmt2 = $pdo->query("
        SELECT DATE_FORMAT(fecha_pedido, '%Y-%m') AS mes, COUNT(*) AS total 
        FROM pedidos 
        GROUP BY mes
    ");
    $data["ordenes"] = $stmt2->fetchAll(PDO::FETCH_ASSOC);

    // Consulta 3: Total de usuarios
    $stmt3 = $pdo->query("SELECT COUNT(*) AS total FROM usuario");
    $usuariosRow = $stmt3->fetch(PDO::FETCH_ASSOC);
    $data["usuario"] = $usuariosRow["total"];

    // Devolver respuesta en formato JSON
    header('Content-Type: application/json');
    echo json_encode($data);

} catch (PDOException $e) {
    // Mostrar error en caso de falla
    http_response_code(500);
    echo json_encode(["error" => "Error en la consulta: " . $e->getMessage()]);
}
