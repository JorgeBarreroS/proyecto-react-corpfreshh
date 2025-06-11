<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

$host = 'corpfresh2025.mysql.database.azure.com';
$dbname = 'corpfreshh';
$username = 'admin_corpfreshh';
$password = 'Corp2027@';

try {
    $conn = new mysqli($host, $username, $password, $dbname);
    
    if ($conn->connect_error) {
        throw new Exception('Error de conexión: ' . $conn->connect_error);
    }

    if (!isset($_GET['usuario'])) {
        throw new Exception('Falta el parámetro usuario');
    }

    $usuario = $conn->real_escape_string($_GET['usuario']);

    // Consulta modificada para usar correo_usuario
    $sql = "SELECT p.*, 
                   (SELECT COUNT(*) FROM pedidos_detalle WHERE pedido_id = p.id) as total_productos
            FROM pedidos p
            WHERE p.correo_usuario = ?
            ORDER BY p.fecha_pedido DESC";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception('Error en la preparación de consulta: ' . $conn->error);
    }

    $stmt->bind_param("s", $usuario);
    if (!$stmt->execute()) {
        throw new Exception('Error al ejecutar consulta: ' . $stmt->error);
    }

    $result = $stmt->get_result();
    if (!$result) {
        throw new Exception('Error al obtener resultados: ' . $stmt->error);
    }

    $pedidos = [];
    while ($row = $result->fetch_assoc()) {
        $pedidos[] = [
            'id' => (int)$row['id'],
            'fecha_pedido' => $row['fecha_pedido'],
            'total' => (float)$row['total'],
            'metodo_pago' => $row['metodo_pago'],
            'direccion_entrega' => $row['direccion_entrega'],
            'estado' => $row['estado'],
            'total_productos' => (int)$row['total_productos'],
            'costo_envio' => isset($row['costo_envio']) ? (float)$row['costo_envio'] : 0,
            'impuestos' => isset($row['impuestos']) ? (float)$row['impuestos'] : 0
        ];
    }

    echo json_encode(['success' => true, 'data' => $pedidos]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
}
?>