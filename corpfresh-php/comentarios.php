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

    try {
        $conn = Conexion::getConexion();
        if (!$conn) {
            throw new Exception("No se pudo obtener la conexión a la base de datos");
        }
    } catch (Exception $e) {
        throw new Exception("Error al conectar con la base de datos: " . $e->getMessage());
    }

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        // ... (código GET existente)
    } elseif ($method === 'POST') {
        $input = file_get_contents("php://input");
        $data = json_decode($input, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Error al decodificar JSON: " . json_last_error_msg() . ". Input recibido: " . substr($input, 0, 100));
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
        // ... (código DELETE existente)
    } else {
        throw new Exception("Método $method no permitido");
    }
} catch (Exception $e) {
    // Limpia cualquier salida que ya se haya generado
    ob_clean();
    
    // Asegura que el encabezado sea JSON
    header("Content-Type: application/json");
    
    // Devuelve el error como JSON válido
    echo json_encode([
        "success" => false, 
        "error" => $e->getMessage()
    ]);
}

// Finaliza y limpia el buffer de salida
ob_end_flush();
?>