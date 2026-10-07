<?php
/**
 * Скрипт обробки авторизації.
 * Приймає дані з форми (email, password), перевіряє їх і встановлює сесію.
 */

// Обов'язково стартуємо сесію перед роботою з $_SESSION
session_start();

// Задаємо еталонні дані користувача (у реальних проектах це береться з бази даних)
$userEmail = 'admin@mail.com';
// Хешуємо пароль алгоритмом sha256 для безпеки. Еталонний пароль "123".
$userPassword = hash('sha256', '123'); 

// Перевіряємо, чи надіслані дані через POST, і чи збігаються вони з еталонними
// Введений пароль також хешуємо перед порівнянням
if (isset($_POST['email']) && isset($_POST['password']) && 
    $_POST['email'] === $userEmail && 
    hash('sha256', $_POST['password']) === $userPassword) {
    
    // Якщо дані вірні, записуємо в сесію прапорець авторизації та ID користувача
    $_SESSION['is_logged'] = true;
    $_SESSION['uid'] = 99; // Унікальний ідентифікатор користувача
    
    // Встановлюємо куку (cookie), яка буде жити 1 хвилину (60 секунд)
    $expireDate = time() + 60; 
    setcookie('user_time', time(), $expireDate, '/');
    
    // Перенаправляємо користувача до секретного кабінету
    header('Location: cabinet.php');
    // Після header('Location: ...') завжди викликаємо exit, щоб зупинити виконання поточного скрипта!
    exit;

} else {
    // Якщо дані невірні, зберігаємо текст помилки
    $errorMessage = "Невірно введений email або пароль!";
}
?>
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Помилка входу</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <?php 
    // Підключаємо навігацію для зручності
    include 'navigation.php'; 
    ?>
    
    <h1>Помилка авторизації</h1>
    <p class="error"><?= htmlspecialchars($errorMessage) ?></p>
    <p>
        <a href="index.php">Повернутися на головну сторінку</a>
    </p>

</body>
</html>