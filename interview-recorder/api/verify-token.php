<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Danh sách token hợp lệ (có thể thay bằng database sau)
$valid_tokens = [
    'ABC123',
    'XYZ999',
    'TOKEN2025',
    'INTERVIEW123'
];

$input = json_decode(file_get_contents('php://input'), true);
$token = $input['token'] ?? '';

if (in_array($token, $valid_tokens)) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(401);
    echo json_encode(['ok' => false, 'message' => 'Invalid token']);
}
?>