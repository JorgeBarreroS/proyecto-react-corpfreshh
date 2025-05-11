<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once 'conexion.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->nombre) && isset($data->email)) {
    try {
        // Establecer valores por defecto si no se proporcionan
        $data->mensaje = empty($data->mensaje) ? '' : $data->mensaje;
        $data->fecha_creacion = empty($data->fecha_creacion) ? date('Y-m-d') : $data->fecha_creacion;
        $data->estado = empty($data->estado) ? 'Pendiente' : $data->estado;
        
        $query = $pdo->prepare("INSERT INTO contactos (
            nombre, 
            email, 
            mensaje, 
            fecha_creacion,
            estado
        ) VALUES (
            :nombre, 
            :email, 
            :mensaje, 
            :fecha_creacion,
            :estado
        )");
        
        $query->bindParam(':nombre', $data->nombre);
        $query->bindParam(':email', $data->email);
        $query->bindParam(':mensaje', $data->mensaje);
        $query->bindParam(':fecha_creacion', $data->fecha_creacion);
        $query->bindParam(':estado', $data->estado);
        
        $query->execute();
        
        $id_contacto = $pdo->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'id_contacto' => $id_contacto,
            'message' => 'Contacto creado con éxito'
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
        'message' => 'Faltan datos requeridos. Se necesita nombre y email.'
    ]);
}