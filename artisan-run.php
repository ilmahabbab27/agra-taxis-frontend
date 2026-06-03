<?php
// Upload to public_html/backend/ — DELETE after use
define('LARAVEL_START', microtime(true));
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

ob_start();
$kernel->call('config:clear');
$kernel->call('cache:clear');
$kernel->call('route:clear');
$out = ob_get_clean();

echo "<pre style='font:14px monospace;padding:20px'>";
echo "=== Artisan Output ===\n\n";
echo htmlspecialchars($out) . "\n";

// Test bcrypt
echo "=== Password Test ===\n";
$hash = '$2y$10$os94nQphnX0aYp.8awhwcOk1zZgtrpVzW7OAxi4POdU6aYK4wFiXa';
echo "Password 'agra2026' matches hash: " . (password_verify('agra2026', $hash) ? '✅ YES' : '❌ NO') . "\n\n";

// Test User model
echo "=== User Lookup ===\n";
try {
    $user = \App\Models\User::where('email', 'admin@agrataxis.com')->first();
    if ($user) {
        echo "User found: {$user->name} <{$user->email}>\n";
        echo "Password verify: " . (Hash::check('agra2026', $user->password) ? '✅ YES' : '❌ NO - wrong password') . "\n";
        echo "HasApiTokens: " . (method_exists($user, 'createToken') ? '✅ YES' : '❌ NO - missing trait') . "\n";
    } else {
        echo "❌ User not found\n";
    }
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n⚠️  DELETE this file after use!\n";
echo "</pre>";
