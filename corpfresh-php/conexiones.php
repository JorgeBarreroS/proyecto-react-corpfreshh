<?php 
class Conexion {
    public static function getConexion() {
        try {
            // Configura tu conexión a la base de datos
            $host = 'corpfresh2025.mysql.database.azure.com';
            $db = 'corpfreshh';
            $user = 'admin_corpfreshh';
            $pass = 'Corp2025@';

            // Crea la conexión PDO
            $dsn = "mysql:host=$host;dbname=$db;charset=utf8";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];

            // Crea la instancia PDO y retorna la conexión
            $pdo = new PDO($dsn, $user, $pass, $options);

            return $pdo; // Retorna la conexión
        } catch (PDOException $e) {
            // En caso de error, muestra el mensaje
            echo json_encode([
                'success' => false,
                'message' => 'Error en la conexión a la base de datos: ' . $e->getMessage()
            ]);
            exit;
        }
    }
}
?>