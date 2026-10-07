<?php
/**
 * Головна сторінка додатку.
 * Тут ми стартуємо сесію, щоб перевірити, чи авторизований користувач,
 * та відображаємо форму для входу (якщо не авторизований).
 */
session_start();
?>

<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Головна сторінка</title>
    <!-- Підключаємо базовий файл стилів -->
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <?php 
    // Підключаємо файл навігації, щоб меню відображалось на цій сторінці
    include 'navigation.php'; 
    ?>

    <h1>Головна сторінка</h1>

    <?php 
    // Перевіряємо, чи порожня змінна сесії 'is_logged'
    // Якщо порожня - значить користувач не авторизований, показуємо форму
    if (empty($_SESSION['is_logged'])): 
    ?>
        <p>Будь ласка, увійдіть до системи, щоб отримати доступ до секретного кабінету.</p>
        
        <!-- Форма відправляє дані методом POST на обробник login.php -->
        <form action="login.php" method="POST">
            <div>
                <label for="email">Електронна пошта:</label><br>
                <input type="email" id="email" name="email" required>
            </div>
            
            <div>
                <label for="password">Пароль:</label><br>
                <input type="password" id="password" name="password" required>
            </div>
            
            <button type="submit">Увійти</button>
        </form>
        
    <?php else: ?>
        <!-- Якщо користувач вже авторизований, виводимо привітання та лінк -->
        <p>Ви вже успішно авторизовані в системі!</p>
        <p>
            <a href="cabinet.php">Перейти до кабінету</a>
        </p>
    <?php endif; ?>

</body>
</html>