<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once 'conexion.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->correo_usuario) && isset($data->id_usuario)) {
    try {
        // Set default values if not provided
        if (empty($data->fecha_pedido)) {
            $data->fecha_pedido = date('Y-m-d');
        }
        if (empty($data->total)) {
            $data->total = 0.00;
        }
        if (empty($data->metodo_pago)) {
            $data->metodo_pago = 'Efectivo';
        }
        if (empty($data->direccion_entrega)) {
            $data->direccion_entrega = '';
        }
        if (empty($data->telefono_contacto)) {
            $data->telefono_contacto = '';
        }
        if (empty($data->costo_envio)) {
            $data->costo_envio = 0.00;
        }
        if (empty($data->impuestos)) {
            $data->impuestos = 0.00;
        }
        if (empty($data->estado)) {
            $data->estado = 'Pendiente';
        }
        
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