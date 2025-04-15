<?php
define('ENCRYPTION_KEY', 'TuClaveSecretaMuyLarga_32_bytes_exacto!!');
define('ENCRYPTION_IV', '1234567890123456'); // 16 bytes

function encryptPassword($password) {
    $encrypted = openssl_encrypt($password, 'AES-256-CBC', ENCRYPTION_KEY, 0, ENCRYPTION_IV);
    return str_pad(base64_encode($encrypted), 256, '0'); // rellena hasta 256 caracteres
}

function decryptPassword($encrypted) {
    $raw = base64_decode(rtrim($encrypted, '0'));
    return openssl_decrypt($raw, 'AES-256-CBC', ENCRYPTION_KEY, 0, ENCRYPTION_IV);
}
?>
