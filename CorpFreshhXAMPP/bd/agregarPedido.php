<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once 'conexion.php';

// Obtener datos del request
$data = json_decode(file_get_contents("php://input"));

// Verificar que hay datos requeridos
if (isset($data->id_venta) && isset($data->id_usuario)) {
    try {
        // Preparar la fecha actual si no se proporciona
        if (empty($data->fecha_pedido)) {
            $data->fecha_pedido = date('Y-m-d');
        }
        
        // Preparar estado por defecto si no se proporciona
        if (empty($data->estado_pedido)) {
            $data->estado_pedido = 'Pendiente';
        }
        
        // Preparar método de envío por defecto si no se proporciona
        if (empty($data->metodo_envio_pedido)) {
            $data->metodo_envio_pedido = 'Estándar';
        }
        
        $query = $pdo->prepare("INSERT INTO pedido (id_venta, id_usuario, fecha_pedido, estado_pedido, metodo_envio_pedido) 
                               VALUES (:id_venta, :id_usuario, :fecha_pedido, :estado_pedido, :metodo_envio_pedido)");
        
        $query->bindParam(':id_venta', $data->id_venta);
        $query->bindParam(':id_usuario', $data->id_usuario);
        $query->bindParam(':fecha_pedido', $data->fecha_pedido);
        $query->bindParam(':estado_pedido', $data->estado_pedido);
        $query->bindParam(':metodo_envio_pedido', $data->metodo_envio_pedido);
        
        $query->execute();
        
        // Obtener el ID generado
        $id_pedido = $pdo->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'id_pedido' => $id_pedido,
            'message' => 'Pedido creado con éxito'
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Faltan datos requeridos. Se necesita ID de venta e ID de usuario.'
    ]);
}