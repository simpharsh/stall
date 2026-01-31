<?php
header('Content-Type: application/json');
require 'db_connect.php';

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'add_order') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Fallback if form-data is used instead of JSON
    if (!$input) {
        $input = $_POST;
    }

    $dish_id = $input['dish_id'] ?? 0;
    $quantity = $input['quantity'] ?? 1;
    $payment_method = $input['payment_method'] ?? 'Cash';
    $payment_status = isset($input['payment_status']) && $input['payment_status'] ? 'Paid' : 'Pending';

    // Fetch dish details to get current price
    $stmt = $pdo->prepare("SELECT name, price FROM menu WHERE id = ?");
    $stmt->execute([$dish_id]);
    $dish = $stmt->fetch();

    if ($dish) {
        $dish_name = $dish['name'];
        $price_per_unit = $dish['price'];
        $total_price = $price_per_unit * $quantity;

        $stmtInsert = $pdo->prepare("INSERT INTO orders (dish_id, dish_name, quantity, price_per_unit, total_price, payment_method, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmtInsert->execute([$dish_id, $dish_name, $quantity, $price_per_unit, $total_price, $payment_method, $payment_status]);

        echo json_encode(['status' => 'success', 'message' => 'Order added']);
    } else {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid Dish ID']);
    }
    exit;
}

if ($action === 'get_history') {
    $stmt = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 50");
    echo json_encode($stmt->fetchAll());
    exit;
}

if ($action === 'get_summary') {
    // Summary for TODAY
    $sql = "SELECT dish_name, SUM(quantity) as total_qty, SUM(total_price) as total_revenue 
            FROM orders 
            WHERE DATE(created_at) = CURRENT_DATE 
            GROUP BY dish_name";
    $stmt = $pdo->query($sql);
    $data = $stmt->fetchAll();

    // Calculate Grand Total
    $grandTotalSql = "SELECT SUM(total_price) as grand_total FROM orders WHERE DATE(created_at) = CURRENT_DATE";
    $stmtTotal = $pdo->query($grandTotalSql);
    $grandTotalResult = $stmtTotal->fetch();
    $grandTotal = $grandTotalResult['grand_total'] ?? 0;

    echo json_encode(['items' => $data, 'grand_total' => $grandTotal]);
    exit;
}

if ($action === 'get_menu') {
    $stmt = $pdo->query("SELECT * FROM menu");
    echo json_encode($stmt->fetchAll());
    exit;
}
?>
