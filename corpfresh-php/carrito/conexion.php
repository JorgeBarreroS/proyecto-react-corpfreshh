<?php
$servername = "corpfresh2025.mysql.database.azure.com";
$username = "admin_corpfreshh";
$password = "Corp2027@";
$dbname = "corpfreshh";

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    error_log("Error de conexión: " . $conn->connect_error);
    // No imprimir errores directamente, solo registrarlos
    exit();
}

// Establecer charset UTF-8
$conn->set_charset("utf8");
?>