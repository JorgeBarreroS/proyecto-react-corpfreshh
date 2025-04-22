<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

// Conexión a la base de datos
$host = 'localhost';
$dbname = 'corpfreshh';
$username = 'root';
$password = '';

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(['error' => 'Error de conexión: ' . $conn->connect_error]));
}

if (!isset($_GET['usuario'])) {
    http_response_code(400);
    die(json_encode(['error' => 'Falta el parámetro usuario']));
}

$usuario = $conn->real_escape_string($_GET['usuario']);

// Consulta para obtener los pedidos del usuario
$sql = "SELECT p.*, 
               (SELECT COUNT(*) FROM pedidos_detalle WHERE pedido_id = p.id) as total_productos
        FROM pedidos p
        WHERE p.usuario = ?
        ORDER BY p.fecha_pedido DESC";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    die(json_encode(['error' => 'Error en la preparación de consulta: ' . $conn->error]));
}

$stmt->bind_param("s", $usuario);
if (!$stmt->execute()) {
    http_response_code(500);
    die(json_encode(['error' => 'Error al ejecutar consulta: ' . $stmt->error]));
}

$result = $stmt->get_result();
$pedidos = [];

while ($row = $result->fetch_assoc()) {
    $pedidos[] = [
        'id' => $row['id'],
        'fecha_pedido' => $row['fecha_pedido'],
        'total' => $row['total'],
        'metodo_pago' => $row['metodo_pago'],
        'direccion_entrega' => $row['direccion_entrega'],
        'estado' => $row['estado'],
        'total_productos' => $row['total_productos']
    ];
}

$stmt->close();
$conn->close();

echo json_encode($pedidos);
?>