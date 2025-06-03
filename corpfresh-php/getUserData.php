<?php
// CONFIGURAR CORS PARA PETICIONES DESDE REACT
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Manejo de la solicitud preflight (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

// Limpiar el buffer de salida antes de enviar JSON
ob_clean();
header('Content-Type: application/json');

// Si es una solicitud GET, solo se pide el rol
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_SESSION['usuario_id'])) {
        echo json_encode(['rol' => $_SESSION['rol']]);
    } else {
        echo json_encode(['rol' => null]);
    }
    exit();
}

// Si es POST, se procesa la búsqueda del usuario
require 'conexiones.php';
$response = ["success" => false, "message" => "Error al obtener datos"];

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['email'])) {
        throw new Exception("El campo 'email' es obligatorio");
    }

    $email = $data['email'];
    $isGoogleRequest = isset($data['isGoogleUser']) ? $data['isGoogleUser'] : false;

    $cnn = Conexion::getConexion();
    $stmt = $cnn->prepare("
        SELECT 
            id_usuario as id,
            nombre_usuario AS nombre, 
            apellido_usuario AS apellido, 
            telefono_usuario AS telefono,
            correo_usuario AS correo, 
            direccion1_usuario AS direccion1,
            direccion2_usuario AS direccion2,
            ciudad_usuario AS ciudad,
            pais_usuario AS pais,
            id_rol as rol
        FROM usuario 
        WHERE correo_usuario = :email
    ");
    $stmt->execute(['email' => $email]);

    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($isGoogleRequest && empty($user['telefono']) && empty($user['direccion1'])) {
            $response = [
                "success" => true,
                "user" => $user,
                "isGoogleUser" => true,
                "requiresProfileCompletion" => true
            ];
        } else {
            $response = [
                "success" => true,
                "user" => $user,
                "isGoogleUser" => $isGoogleRequest
            ];
        }
    } else {
        if ($isGoogleRequest) {
            $response = [
                "success" => true,
                "user" => [
                    "correo" => $email,
                    "nombre" => "",
                    "apellido" => "",
                    "telefono" => "",
                    "direccion1" => "",
                    "direccion2" => "",
                    "ciudad" => "",
                    "pais" => "",
                    "rol" => 2
                ],
                "isGoogleUser" => true,
                "requiresProfileCompletion" => true
            ];
        } else {
            throw new Exception("Usuario no encontrado");
        }
    }
} catch (Exception $e) {
    http_response_code(400);
    $response["message"] = $e->getMessage();
}

// Imprimir un único JSON
echo json_encode($response);
exit();
?>
