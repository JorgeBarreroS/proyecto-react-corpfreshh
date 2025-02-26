<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    exit();
}

require_once 'conexiones.php'; // Archivo de conexión a la base de datos

if (!class_exists('Conexion')) {
    echo json_encode(["success" => false, "error" => "Clase Conexion no encontrada"]);
    exit();
}

try {
    $conn = Conexion::getConexion();
    if (!$conn) {
        throw new Exception("No se pudo obtener la conexión a la base de datos");
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => "Error al conectar con la base de datos: " . $e->getMessage()]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['id_producto'])) {
        $id_producto = intval($_GET['id_producto']);
        
        if ($id_producto <= 0) {
            echo json_encode(["success" => false, "error" => "ID de producto no válido"]);
            exit();
        }
        
        $sql = "SELECT id_comentario, id_usuario, comentario, puntuacion, fecha FROM comentarios WHERE id_producto = ? ORDER BY fecha DESC";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$id_producto]);
        $comentarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(["success" => true, "comentarios" => $comentarios]);
    } else {
        echo json_encode(["success" => false, "error" => "ID de producto no especificado"]);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (isset($data['id_producto'], $data['texto'], $data['puntuacion'], $data['usuario'])) {
        $id_producto = intval($data['id_producto']);
        $texto = trim($data['texto']);
        $puntuacion = intval($data['puntuacion']);
        $usuario = trim($data['usuario']);
        
        if ($id_producto <= 0 || empty($texto) || empty($usuario) || $puntuacion < 1 || $puntuacion > 5) {
            echo json_encode(["success" => false, "error" => "Datos de comentario no válidos"]);
            exit();
        }
        
        $sql = "INSERT INTO comentarios (id_usuario, id_producto, comentario, puntuacion, fecha) VALUES (?, ?, ?, ?, NOW())";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$id_producto, $usuario, $texto, $puntuacion]);
        
        echo json_encode(["success" => true, "comentario" => [
            "id_comentario" => $conn->lastInsertId(), "usuario" => $usuario, "texto" => $texto, "puntuacion" => $puntuacion
        ]]);
    } else {
        echo json_encode(["success" => false, "error" => "Datos incompletos"]);
    }
} elseif ($method === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (isset($data['id_comentario'])) {
        $id_comentario = intval($data['id_comentario']);
        
        if ($id_comentario <= 0) {
            echo json_encode(["success" => false, "error" => "ID de comentario no válido"]);
            exit();
        }
        
        $sql = "DELETE FROM comentarios WHERE id_comentario = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$id_comentario]);
        
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => "ID de comentario no especificado"]);
    }
} else {
    echo json_encode(["success" => false, "error" => "Método no permitido"]);
}
?>
