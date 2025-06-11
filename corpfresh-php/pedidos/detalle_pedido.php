<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

$host = 'corpfresh2025.mysql.database.azure.com';
$dbname = 'corpfreshh';
$username = 'admin_corpfreshh';
$password = 'Corp2025@';

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(['error' => 'Error de conexión: ' . $conn->connect_error]));
}

if (!isset($_GET['pedido_id'])) {
    http_response_code(400);
    die(json_encode(['error' => 'Falta el parámetro pedido_id']));
}

$pedido_id = intval($_GET['pedido_id']);

try {
    // Obtener información del pedido
    $sql_pedido = "SELECT * FROM pedidos WHERE id = ?";
    $stmt_pedido = $conn->prepare($sql_pedido);
    $stmt_pedido->bind_param("i", $pedido_id);
    $stmt_pedido->execute();
    $pedido = $stmt_pedido->get_result()->fetch_assoc();
    $stmt_pedido->close();

    if (!$pedido) {
        http_response_code(404);
        die(json_encode(['error' => 'Pedido no encontrado']));
    }

    // Obtener items del pedido
    $sql_items = "SELECT * FROM pedidos_detalle WHERE pedido_id = ?";
    $stmt_items = $conn->prepare($sql_items);
    $stmt_items->bind_param("i", $pedido_id);
    $stmt_items->execute();
    $items = $stmt_items->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt_items->close();

    $pedido['items'] = $items;

    echo json_encode($pedido);
} catch (Exception $e) {
    http_response_code(500);
    die(json_encode(['error' => 'Error al obtener el pedido: ' . $e->getMessage()]));
}

$conn->close();
?>