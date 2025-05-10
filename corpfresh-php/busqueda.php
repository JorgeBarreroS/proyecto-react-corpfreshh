<?php
// Configurar encabezados CORS
header("Access-Control-Allow-Origin: *"); // Permitir acceso desde cualquier origen
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); // Métodos permitidos
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Encabezados permitidos

// Manejar solicitudes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Incluir el archivo de conexión
include 'conexiones.php';

// Configurar encabezado para JSON
header('Content-Type: application/json');

// Inicializar el array de productos
$productos = [];

// Manejo de errores
try {
    // Obtener la conexión utilizando la clase Conexion
    $conn = Conexion::getConexion();
    
    // Comprobar si se ha pasado un término de búsqueda
    if (isset($_GET['q']) && !empty($_GET['q'])) {
        // Buscar productos por nombre
        $busqueda = $_GET['q'];
        $sql = "SELECT id_producto, nombre_producto, precio_producto, imagen_producto 
                FROM producto 
                WHERE nombre_producto LIKE :busqueda";
        $stmt = $conn->prepare($sql);
        $searchTerm = '%' . $busqueda . '%';
        $stmt->bindParam(':busqueda', $searchTerm, PDO::PARAM_STR);
        $stmt->execute();
        $productos = $stmt->fetchAll();
    } else {
        // Mostrar los primeros 5 productos si no hay búsqueda
        $sql = "SELECT id_producto, nombre_producto, precio_producto, imagen_producto 
                FROM producto 
                LIMIT 5";
        $stmt = $conn->query($sql);
        $productos = $stmt->fetchAll();
    }

    // Devolver los productos como JSON
    echo json_encode($productos, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    // En caso de error, devolver un mensaje de error en JSON
    http_response_code(500);
    echo json_encode(['error' => 'Error al procesar la solicitud: ' . $e->getMessage()]);
}
?>