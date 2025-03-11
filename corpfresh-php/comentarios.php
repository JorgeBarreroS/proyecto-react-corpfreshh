<?php
// Deshabilita la salida de errores PHP como HTML
ini_set('display_errors', 0);
error_reporting(0);

// Inicia un buffer de salida para capturar cualquier salida no deseada
ob_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    exit();
}

// Encierra todo el código en un bloque try-catch global
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

    if ($method === 'GET') {
        // Verificar si se recibió el id_producto
        if (!isset($_GET['id_producto']) || intval($_GET['id_producto']) <= 0) {
            throw new Exception("Falta el parámetro 'id_producto' válido");
        }

        $id_producto = intval($_GET['id_producto']);

        // Consulta para obtener los comentarios del producto específico
        $sql = "SELECT c.id_comentario, c.comentario, c.puntuacion, c.fecha, 
                       u.correo_usuario AS usuario
                FROM comentarios c
                JOIN usuario u ON c.id_usuario = u.id_usuario
                WHERE c.id_producto = ?
                ORDER BY c.fecha DESC";

        $stmt = $conn->prepare($sql);
        $stmt->execute([$id_producto]);
        $comentarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Retornar el resultado en formato JSON
        echo json_encode($comentarios);
    } elseif ($method === 'POST') {
        $input = file_get_contents("php://input");
        $data = json_decode($input, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Error al decodificar JSON: " . json_last_error_msg());
        }

        if (!isset($data['id_producto']) || !isset($data['puntuacion']) || !isset($data['usuario']) || 
            (!isset($data['texto']) && !isset($data['comentario']))) {
            throw new Exception("Datos incompletos. Recibidos: " . json_encode($data));
        }

        $id_producto = intval($data['id_producto']);
        $texto = trim(isset($data['comentario']) ? $data['comentario'] : $data['texto']);
        $puntuacion = intval($data['puntuacion']);
        $usuario = trim($data['usuario']);

        if ($id_producto <= 0 || empty($texto) || empty($usuario) || $puntuacion < 1 || $puntuacion > 5) {
            throw new Exception("Datos de comentario no válidos");
        }

        // Buscar el ID del usuario basado en el correo
        $sqlUsuario = "SELECT id_usuario FROM usuario WHERE correo_usuario = ?";
        $stmtUsuario = $conn->prepare($sqlUsuario);
        $stmtUsuario->execute([$usuario]); 
        $idUsuario = $stmtUsuario->fetchColumn();

        if (!$idUsuario) {
            throw new Exception("Usuario con correo '$usuario' no encontrado en la base de datos");
        }

        // Insertar el comentario con el id_usuario correcto
        $sql = "INSERT INTO comentarios (id_usuario, id_producto, comentario, puntuacion, fecha) 
                VALUES (?, ?, ?, ?, NOW())";
        $stmt = $conn->prepare($sql);
        $result = $stmt->execute([$idUsuario, $id_producto, $texto, $puntuacion]);

        if (!$result) {
            throw new Exception("Error al insertar en la base de datos: " . implode(" ", $stmt->errorInfo()));
        }

        // Devolver respuesta con formato consistente
        echo json_encode([
            "success" => true, 
            "comentario" => [
                "id_comentario" => $conn->lastInsertId(), 
                "id_usuario" => $idUsuario,
                "comentario" => $texto, 
                "puntuacion" => $puntuacion
            ]
        ]);
    } elseif ($method === 'DELETE') {
        // Aquí va la lógica para eliminar comentarios
    } else {
        throw new Exception("Método $method no permitido");
    }
} catch (Exception $e) {
    ob_clean();
    header("Content-Type: application/json");
    echo json_encode([
        "success" => false, 
        "error" => $e->getMessage()
    ]);
}

ob_end_flush();
?>
