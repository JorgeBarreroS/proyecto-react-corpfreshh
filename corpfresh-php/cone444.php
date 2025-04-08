<?php
function conectar() {
    $host = "localhost";
    $usuario = "root";
    $contrasena = "";
    $bd = "corpfreshh";

    $conexion = new mysqli($host, $usuario, $contrasena, $bd);
    if ($conexion->connect_error) {
        die("Conexión fallida: " . $conexion->connect_error);
    }
    return $conexion;
}
?>
