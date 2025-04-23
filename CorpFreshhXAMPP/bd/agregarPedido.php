<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once 'conexion.php';

$data = json_decode(file_get_contents("php://input"));

// Estados permitidos en minúsculas como en la BD
$estadosPermitidos = ['pendiente', 'procesando', 'enviado', 'completado', 'cancelado'];

if (isset($data->correo_usuario) && isset($data->id_usuario)) {
    try {
        // Validar estado si está presente
        if (!empty($data->estado)) {
            $estado = strtolower($data->estado);
            if (!in_array($estado, $estadosPermitidos)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Estado no válido. Los estados permitidos son: pendiente, procesando, enviado, completado, cancelado'
                ]);
                exit;
            }
            $data->estado = $estado;
        }

        // Set default values if not provided
        $data->fecha_pedido = empty($data->fecha_pedido) ? date('Y-m-d') : $data->fecha_pedido;
        $data->total = empty($data->total) ? 0.00 : floatval($data->total);
        $data->metodo_pago = empty($data->metodo_pago) ? 'Efectivo' : $data->metodo_pago;
        $data->direccion_entrega = empty($data->direccion_entrega) ? '' : $data->direccion_entrega;
        $data->telefono_contacto = empty($data->telefono_contacto) ? '' : $data->telefono_contacto;
        $data->costo_envio = empty($data->costo_envio) ? 0.00 : floatval($data->costo_envio);
        $data->impuestos = empty($data->impuestos) ? 0.00 : floatval($data->impuestos);
        $data->estado = empty($data->estado) ? 'pendiente' : strtolower($data->estado);
        
        $query = $pdo->prepare("INSERT INTO pedidos (
            correo_usuario, 
            id_usuario, 
            fecha_pedido, 
            total, 
            metodo_pago, 
            direccion_entrega, 
            telefono_contacto, 
            costo_envio, 
            impuestos, 
            estado
        ) VALUES (
            :correo_usuario, 
            :id_usuario, 
            :fecha_pedido, 
            :total, 
            :metodo_pago, 
            :direccion_entrega, 
            :telefono_contacto, 
            :costo_envio, 
            :impuestos, 
            :estado
        )");
        
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
        'message' => 'Faltan datos requeridos. Se necesita correo e ID de usuario.'
    ]);
}