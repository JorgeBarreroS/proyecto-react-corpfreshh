<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Habilitar logging para depuración
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include_once '../conexion.php';

// Obtener el contenido JSON del cuerpo de la solicitud
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Registrar datos recibidos para depuración
error_log("Datos recibidos: " . print_r($data, true));

if (!$data || !isset($data['id_oferta'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Datos inválidos o falta el ID de la oferta',
        'received_data' => $data // Para depuración
    ]);
    exit;
}

try {
    // 1. Validar conexión a la base de datos
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // 2. Obtener oferta actual para verificar existencia
    $stmtCheck = $pdo->prepare("SELECT * FROM ofertas_especiales WHERE id_oferta = ?");
    $stmtCheck->execute([$data['id_oferta']]);
    $ofertaActual = $stmtCheck->fetch(PDO::FETCH_ASSOC);
    
    if (!$ofertaActual) {
        echo json_encode([
            'success' => false,
            'message' => 'La oferta no existe',
            'id_buscado' => $data['id_oferta']
        ]);
        exit;
    }
    
    // 3. Preparar datos para actualización
    $campos = [
        'titulo' => $data['titulo'] ?? $ofertaActual['titulo'],
        'descripcion' => $data['descripcion'] ?? $ofertaActual['descripcion'],
        'porcentaje_descuento' => $data['porcentaje_descuento'] ?? $ofertaActual['porcentaje_descuento'],
        'fecha_inicio' => $data['fecha_inicio'] ?? $ofertaActual['fecha_inicio'],
        'fecha_fin' => $data['fecha_fin'] ?? $ofertaActual['fecha_fin'],
        'texto_boton' => $data['texto_boton'] ?? $ofertaActual['texto_boton'],
        'id_producto' => isset($data['id_producto']) ? ($data['id_producto'] ?: null) : $ofertaActual['id_producto'],
        'id_categoria' => isset($data['id_categoria']) ? ($data['id_categoria'] ?: null) : $ofertaActual['id_categoria']
    ];
    
    // Manejo especial para el campo 'activo'
    if (isset($data['activo'])) {
        $campos['activo'] = (in_array($data['activo'], ['1', 1, true, 'true'], true)) ? 1 : 0;
    } else {
        $campos['activo'] = $ofertaActual['activo'];
    }
    
    // 4. Construir consulta dinámica
    $updates = [];
    $valores = [];
    
    foreach ($campos as $campo => $valor) {
        $updates[] = "$campo = ?";
        $valores[] = $valor;
    }
    
    $valores[] = $data['id_oferta']; // Para el WHERE
    
    $sql = "UPDATE ofertas_especiales SET " . implode(', ', $updates) . " WHERE id_oferta = ?";
    
    // 5. Ejecutar actualización
    $stmtUpdate = $pdo->prepare($sql);
    $success = $stmtUpdate->execute($valores);
    
    if ($success) {
        // 6. Obtener oferta actualizada para verificar
        $stmtVerify = $pdo->prepare("SELECT * FROM ofertas_especiales WHERE id_oferta = ?");
        $stmtVerify->execute([$data['id_oferta']]);
        $ofertaActualizada = $stmtVerify->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'message' => 'Oferta actualizada correctamente',
            'data' => $ofertaActualizada, // Devuelve los datos actualizados
            'changes_applied' => $campos // Para depuración
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No se pudo actualizar la oferta',
            'error_info' => $stmtUpdate->errorInfo() // Para depuración
        ]);
    }
} catch(PDOException $e) {
    error_log("Error en actualizarOfertaCompleta: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error de base de datos',
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString() // Solo para desarrollo
    ]);
}