<?php
// Configuración de sesión más específica
ini_set('session.use_strict_mode', 1);
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);

// Configurar el dominio y path de la cookie para que sea más permisivo
session_set_cookie_params([
    'lifetime' => 86400,  // 24 horas
    'path' => '/',
    'domain' => 'localhost',
    'secure' => false,    // Cambiar a true si usas HTTPS
    'httponly' => true,
    'samesite' => 'Lax'  // Cambia según tu configuración
]);

session_name('PHPSESSID');  // Nombre estándar de sesión
session_start();

// Depuración
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Asegurar que el carrito exista
if (!isset($_SESSION['carrito'])) {
    $_SESSION['carrito'] = [];
}

// Headers CORS más detallados
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

// Manejar preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Inicializar el carrito si no existe
if (!isset($_SESSION['carrito'])) {
    $_SESSION['carrito'] = [];
}

// Manejar solicitudes GET para obtener el carrito
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $total = array_reduce($_SESSION['carrito'], fn($sum, $item) => $sum + $item['subtotal'], 0);
    
    // Si el carrito está vacío
    if (empty($_SESSION['carrito'])) {
        echo json_encode([
            'status' => 'success',
            'cart' => [],
            'total' => '0.00'
        ]);
    } else {
        echo json_encode([
            'status' => 'success',
            'cart' => $_SESSION['carrito'],
            'total' => number_format($total, 2)
        ]);
    }
    exit;
}

// Manejar solicitudes POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (isset($input['accion'])) {
        switch ($input['accion']) {
            case 'agregar':
                if (isset($input['id_producto'], $input['nombre'], $input['precio'], $input['imagen'], $input['cantidad'])) {
                    $idProducto = $input['id_producto'];
                    
                    // Buscar si el producto ya existe en el carrito
                    $index = array_search($idProducto, array_column($_SESSION['carrito'], 'id_producto'));
                    
                    if ($index !== false) {
                        // Actualizar cantidad si el producto ya existe
                        $_SESSION['carrito'][$index]['cantidad'] += $input['cantidad'];
                        $_SESSION['carrito'][$index]['subtotal'] = $_SESSION['carrito'][$index]['cantidad'] * $_SESSION['carrito'][$index]['precio'];
                    } else {
                        // Agregar nuevo producto
                        $_SESSION['carrito'][] = [
                            'id_producto' => $idProducto,
                            'nombre' => $input['nombre'],
                            'precio' => $input['precio'],
                            'imagen' => $input['imagen'],
                            'cantidad' => $input['cantidad'],
                            'subtotal' => $input['precio'] * $input['cantidad']
                        ];
                    }

                    // Calcular total
                    $total = array_reduce($_SESSION['carrito'], fn($sum, $item) => $sum + $item['subtotal'], 0);

                    echo json_encode([
                        'status' => 'success',
                        'cart' => $_SESSION['carrito'],
                        'total' => number_format($total, 2)
                    ]);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Datos incompletos']);
                }
                break;

            case 'actualizar':
                if (isset($input['id_producto'], $input['cantidad'])) {
                    $index = array_search($input['id_producto'], array_column($_SESSION['carrito'], 'id_producto'));
                    
                    if ($index !== false) {
                        $_SESSION['carrito'][$index]['cantidad'] = $input['cantidad'];
                        $_SESSION['carrito'][$index]['subtotal'] = $_SESSION['carrito'][$index]['cantidad'] * $_SESSION['carrito'][$index]['precio'];

                        $total = array_reduce($_SESSION['carrito'], fn($sum, $item) => $sum + $item['subtotal'], 0);

                        echo json_encode([
                            'status' => 'success',
                            'cart' => $_SESSION['carrito'],
                            'total' => number_format($total, 2)
                        ]);
                    } else {
                        echo json_encode(['status' => 'error', 'message' => 'Producto no encontrado']);
                    }
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Datos incompletos para actualizar']);
                }
                break;

            case 'eliminar':
                if (isset($input['id_producto'])) {
                    $_SESSION['carrito'] = array_filter($_SESSION['carrito'], function($producto) use ($input) {
                        return $producto['id_producto'] != $input['id_producto'];
                    });

                    $_SESSION['carrito'] = array_values($_SESSION['carrito']);

                    $total = array_reduce($_SESSION['carrito'], fn($sum, $item) => $sum + $item['subtotal'], 0);

                    echo json_encode([
                        'status' => 'success',
                        'cart' => $_SESSION['carrito'],
                        'total' => number_format($total, 2)
                    ]);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'ID de producto requerido']);
                }
                break;

            default:
                echo json_encode(['status' => 'error', 'message' => 'Acción no válida']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Acción requerida']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido']);
}
?>
