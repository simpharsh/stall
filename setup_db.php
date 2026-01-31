<?php
$host = 'localhost';
$user = 'root';
$pass = '';

try {
    // Connect to MySQL server
    $pdo = new PDO("mysql:host=$host", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create Database
    $pdo->exec("CREATE DATABASE IF NOT EXISTS stall_pos");
    echo "Database 'stall_pos' created or already exists.<br>";

    // Connect to the specific database
    $pdo->exec("USE stall_pos");

    // Create Menu Table
    $sqlMenu = "CREATE TABLE IF NOT EXISTS menu (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL
    )";
    $pdo->exec($sqlMenu);
    echo "Table 'menu' created.<br>";

    // Seed Menu Data
    $menuItems = [
        ['name' => 'KUNAFA ICE CREAM WITH PISTACHIO', 'price' => 149],
        ['name' => 'KUNAFA ICE CREAM WITH STRAWBERRY', 'price' => 149],
        ['name' => 'KUNAFA ICE CREAM WITH DARK CHOCOLATE', 'price' => 149],
        ['name' => 'KUNAFA ICE CREAM WITH MILK CHOCOLATE', 'price' => 149],
        ['name' => 'KUNAFA ICE CREAM WITH WHITE CHOCOLATE', 'price' => 149],
        ['name' => 'KUNAFA ICE CREAM WITH TRIPLE CHOCOLATE', 'price' => 149]
    ];

    $stmtCheck = $pdo->query("SELECT COUNT(*) FROM menu");
    if ($stmtCheck->fetchColumn() == 0) {
        $stmt = $pdo->prepare("INSERT INTO menu (name, price) VALUES (:name, :price)");
        foreach ($menuItems as $item) {
            $stmt->execute($item);
        }
        echo "Menu data seeded.<br>";
    } else {
        echo "Menu data already exists.<br>";
    }

    // Create Orders Table
    $sqlOrders = "CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dish_id INT,
        dish_name VARCHAR(255),
        quantity INT,
        price_per_unit DECIMAL(10,2),
        total_price DECIMAL(10,2),
        payment_method VARCHAR(50),
        payment_status VARCHAR(50), /* 'Paid', 'Pending' */
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sqlOrders);
    echo "Table 'orders' created.<br>";

    echo "Setup Complete!";

} catch (PDOException $e) {
    die("DB Error: " . $e->getMessage());
}
