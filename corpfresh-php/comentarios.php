<?php
// Deshabilita la salida de errores PHP como HTML
ini_set('display_errors', 0);
error_reporting(0);

// Inicia un buffer de salida para capturar cualquier salida no deseada
ob_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    exit();
}

try {
    require_once 'conexiones.php';

    if (!class_exists('Conexion')) {
        throw new Exception("Clase Conexion no encontrada");
    }

    $conn = Conexion::getConexion();
    if (!$conn) {
        throw new Exception("No se pudo obtener la conexión a la base de datos");
    }

    $method = $_SERVER['REQUEST_METHOD'];
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);

    switch ($method) {
        case 'GET':
            if (!isset($_GET['id_producto']) || intval($_GET['id_producto']) <= 0) {
                throw new Exception("Falta el parámetro 'id_producto' válido");
            }

            $id_producto = intval($_GET['id_producto']);
            $sql = "SELECT c.id_comentario, c.comentario, c.puntuacion, c.fecha, u.correo_usuario AS usuario
                    FROM comentarios c
                    JOIN usuario u ON c.id_usuario = u.id_usuario
                    WHERE c.id_producto = ? ORDER BY c.fecha DESC";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$id_producto]);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;

        case 'POST':
            if (!isset($data['id_producto'], $data['puntuacion'], $data['usuario'], $data['comentario'])) {
                throw new Exception("Datos incompletos");
            }

            $id_producto = intval($data['id_producto']);
            $puntuacion = intval($data['puntuacion']);
            $usuario = trim($data['usuario']);
            $comentario = trim($data['comentario']);

            $stmtUsuario = $conn->prepare("SELECT id_usuario FROM usuario WHERE correo_usuario = ?");
            $stmtUsuario->execute([$usuario]);
            $idUsuario = $stmtUsuario->fetchColumn();

            if (!$idUsuario) {
                throw new Exception("Usuario no encontrado");
            }

            $sql = "INSERT INTO comentarios (id_usuario, id_producto, comentario, puntuacion, fecha) VALUES (?, ?, ?, ?, NOW())";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$idUsuario, $id_producto, $comentario, $puntuacion]);
            echo json_encode(["success" => true, "id_comentario" => $conn->lastInsertId()]);
            break;

        case 'PUT':
        case 'PATCH':
            if (!isset($data['id_comentario'], $data['comentario'])) {
                throw new Exception("Datos incompletos");
            }

            $id_comentario = intval($data['id_comentario']);
            $comentario = trim($data['comentario']);
            $sql = "UPDATE comentarios SET comentario = ? WHERE id_comentario = ?";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$comentario, $id_comentario]);
            echo json_encode(["success" => true, "message" => "Comentario actualizado"]);
            break;

        case 'DELETE':
            if (!isset($data['id_comentario'])) {
                throw new Exception("Falta el parámetro 'id_comentario'");
            }

            $id_comentario = intval($data['id_comentario']);
            $sql = "DELETE FROM comentarios WHERE id_comentario = ?";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$id_comentario]);
            echo json_encode(["success" => true, "message" => "Comentario eliminado"]);
            break;

        default:
            throw new Exception("Método $method no permitido");
    }
} catch (Exception $e) {
    ob_clean();
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

ob_end_flush();
?>
