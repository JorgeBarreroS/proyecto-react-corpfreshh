<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'conexiones.php';

try {
    $conn = Conexion::getConexion();
    echo json_encode(["success" => true, "message" => "Conexión a la base de datos exitosa"]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
