<?php
date_default_timezone_set('Asia/Bangkok');
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$token = $input['token'] ?? '';
$userName = $input['userName'] ?? '';

if (empty($token) || empty($userName)) {
    http_response_code(400);
    echo json_encode(['ok' => false]);
    exit;
}

// Tạo tên thư mục an toàn
$sanitizedName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $userName);
$folder = date('d_m_Y_H_i') . '_' . $sanitizedName;

$fullPath = __DIR__ . '/../uploads/' . $folder;
if (!is_dir($fullPath)) {
    mkdir($fullPath, 0777, true);
}

// Khởi tạo meta.json
file_put_contents($fullPath . '/meta.json', json_encode([
    'userName' => $userName,
    'token' => $token,
    'startedAt' => date('c'),
    'timeZone' => 'Asia/Bangkok',
    'questions' => []
], JSON_PRETTY_PRINT));

echo json_encode(['ok' => true, 'folder' => $folder]);
?>