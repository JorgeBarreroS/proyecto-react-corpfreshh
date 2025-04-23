<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once 'conexion.php';

$data = json_decode(file_get_contents("php://input"));

// Validar estados permitidos (en minúsculas como en la BD)
$estadosPermitidos = ['pendiente', 'procesando', 'enviado', 'completado', 'cancelado'];

if (isset($data->id)) {
    try {
        // Validar estado si está presente
        if (isset($data->estado)) {
            $estado = strtolower($data->estado);
            if (!in_array($estado, $estadosPermitidos)) {
                echo json_encode(['error' => 'Estado no válido. Use: pendiente, procesando, enviado, completado o cancelado']);
                exit;
            }
            $data->estado = $estado;
        }

        $query = $pdo->prepare("UPDATE pedidos SET 
            correo_usuario = :correo_usuario, 
            id_usuario = :id_usuario, 
            fecha_pedido = :fecha_pedido, 
            total = :total, 
            metodo_pago = :metodo_pago, 
            direccion_entrega = :direccion_entrega, 
            telefono_contacto = :telefono_contacto, 
            costo_envio = :costo_envio, 
            impuestos = :impuestos, 
            estado = :estado 
            WHERE id = :id");

        $query->bindParam(':id', $data->id);
        $query->bindParam(':correo_usuario', $data->correo_usuario);
        $query->bindParam(':id_usuario', $data->id_usuario);
        $query->bindParam(':fecha_pedido', $data->fecha_pedido);
        $query->bindParam(':total', $data->total);
        $query->bindParam(':metodo_pago', $data->metodo_pago);
        $query->bindParam(':direccion_entrega', $data->direccion_entrega);
        $query->bindParam(':telefono_contacto', $data->telefono_contacto);
        $query->bindParam(':costo_envio', $data->costo_envio);
        $query->bindParam(':impuestos', $data->impuestos);
        $query->bindParam(':estado', $data->estado);
        
        $query->execute();

        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['error' => 'Faltan parámetros requeridos']);
}