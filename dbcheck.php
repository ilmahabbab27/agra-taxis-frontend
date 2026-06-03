<?php
// Upload to public_html/backend/ and visit https://agrataxis.com/backend/dbcheck.php
// DELETE this file after use.

$env = [];
foreach (file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
    if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) continue;
    [$key, $val] = explode('=', $line, 2);
    $env[trim($key)] = trim($val, " \"'");
}

$host = $env['DB_HOST'] ?? '127.0.0.1';
$port = $env['DB_PORT'] ?? '3306';
$db   = $env['DB_DATABASE'] ?? '';
$user = $env['DB_USERNAME'] ?? '';
$pass = $env['DB_PASSWORD'] ?? '';

echo "<pre style='font:14px monospace;padding:20px'>";
echo "=== DB CHECK ===\n\n";
echo "Host:     $host:$port\n";
echo "Database: $db\n";
echo "User:     $user\n\n";

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$db;charset=utf8", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 5,
    ]);
    echo "✅ Connected successfully\n\n";

    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "Tables (" . count($tables) . "):\n";
    foreach ($tables as $t) {
        $count = $pdo->query("SELECT COUNT(*) FROM `$t`")->fetchColumn();
        echo "  - $t ($count rows)\n";
    }

    echo "\n=== USERS ===\n";
    if (in_array('users', $tables)) {
        $users = $pdo->query("SELECT id, name, email, created_at FROM users")->fetchAll(PDO::FETCH_ASSOC);
        foreach ($users as $u) {
            echo "  [{$u['id']}] {$u['name']} <{$u['email']}> ({$u['created_at']})\n";
        }
        if (empty($users)) echo "  (no users)\n";
    } else {
        echo "  ❌ users table does not exist\n";
    }

    echo "\n=== MIGRATIONS ===\n";
    if (in_array('migrations', $tables)) {
        $migs = $pdo->query("SELECT migration, batch FROM migrations ORDER BY batch, id")->fetchAll(PDO::FETCH_ASSOC);
        foreach ($migs as $m) {
            echo "  [batch {$m['batch']}] {$m['migration']}\n";
        }
    } else {
        echo "  ❌ migrations table does not exist — run php artisan migrate\n";
    }

    echo "\n=== PHP & LARAVEL ===\n";
    echo "PHP version: " . PHP_VERSION . "\n";
    echo "APP_ENV:     " . ($env['APP_ENV'] ?? 'not set') . "\n";
    echo "APP_DEBUG:   " . ($env['APP_DEBUG'] ?? 'not set') . "\n";
    echo "APP_KEY set: " . (!empty($env['APP_KEY']) ? '✅ yes' : '❌ NO') . "\n";

} catch (PDOException $e) {
    echo "❌ Connection FAILED:\n";
    echo "   " . $e->getMessage() . "\n\n";
    echo "Check DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD in .env\n";
}

echo "\n⚠️  DELETE this file after use!\n";
echo "</pre>";
