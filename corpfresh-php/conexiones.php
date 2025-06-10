<?php 
class Conexion {
    public static function getConexion() {
        try {
            // Datos de tu base de datos en Render
            $host = 'dpg-d136bj3uibrs73fs0t7g-a.oregon-postgres.render.com';
            $db   = 'corpfreshh';
            $user = 'corpfreshh_user';
            $pass = '6qrthNQk8tRMDSLe6e5YAWdLEYqU1H1N';
            $port = '5432';

            // DSN para PostgreSQL
            $dsn = "pgsql:host=$host;port=$port;dbname=$db";

            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];

            $pdo = new PDO($dsn, $user, $pass, $options);

            return $pdo;
        } catch (PDOException $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Error en la conexión a PostgreSQL: ' . $e->getMessage()
            ]);
            exit;
        }
    }
}
?>

