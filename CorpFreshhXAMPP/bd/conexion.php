  <?php
$host = 'corpfresh2025.mysql.database.azure.com';
$dbname = 'corpfreshh';
$user = 'admin_corpfreshh';
$password = 'Corp2025@';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // Devuelve un JSON en lugar de texto plano
    header('Content-Type: application/json');
    die(json_encode(['error' => "Error de conexión: " . $e->getMessage()]));
}