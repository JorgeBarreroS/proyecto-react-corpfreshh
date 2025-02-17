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

include 'conexion.php';

// Configurar encabezado para JSON
header('Content-Type: application/json');

// Inicializar el array de productos
$productos = [];

// Manejo de errores
try {
    // Comprobar si se ha pasado un término de búsqueda
    if (isset($_GET['q']) && !empty($_GET['q'])) {
        // Buscar productos por nombre
        $busqueda = $_GET['q'];
        $sql = "SELECT id_producto, nombre_producto, precio_producto, imagen_producto 
                FROM producto 
                WHERE nombre_producto LIKE ?";
        $stmt = $conn->prepare($sql);
        $searchTerm = '%' . $busqueda . '%';
        $stmt->bind_param('s', $searchTerm);
        $stmt->execute();
        $result = $stmt->get_result();
        while ($producto = $result->fetch_assoc()) {
            $productos[] = $producto;
        }
    } else {
        // Mostrar los primeros 6 productos si no hay búsqueda
        $sql = "SELECT id_producto, nombre_producto, precio_producto, imagen_producto 
                FROM producto 
                LIMIT 7";
        $result = $conn->query($sql);
        while ($producto = $result->fetch_assoc()) {
            $productos[] = $producto;
        }
    }

    // Devolver los productos como JSON (asegurar que es un array válido)
    echo json_encode($productos, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
} catch (Exception $e) {
    // En caso de error, devolver un mensaje de error en JSON
    http_response_code(500);
    echo json_encode(['error' => 'Error al procesar la solicitud: ' . $e->getMessage()]);
}
?>
