<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <form action="upload.php" method="POST" enctype="multipart/form-data">
    <label>Оберіть своє фото (Аватар):</label><br>
    <!-- type="file" створює кнопку "Огляд..." в браузері -->
    <!-- Атрибут accept (необов'язковий) підказує браузеру показувати лише картинки -->
    <input type="file" name="avatar" accept="image/png, image/jpeg" /><br>  

    <button type="submit">Завантажити</button>
    </form>

    <h1>Список завантажених фалів</h1>
    <ul>
        <?php
        // 1. Вказуємо шлях до папки, де лежать файли
        $dir = 'uploads/';

        // 2. Отримуємо масив всіх файлів у цій папці
        // scandir повертає всі файли, включно з . і .. (системні папки)
        $files = scandir($dir);

        // 3. Перебираємо всі знайдені елементи масиву
        foreach ($files as $file) {
            // Пропускаємо системні папки "dot" (.) і "dot dot" (..)
            if ($file === '.' || $file === '..') {
                continue;
            }
            
            // Виводимо кожен файл як елемент списку
            echo "<li><a href='uploads/$file'>$file</a></li>";
        }
        ?>
    </ul>

</body>
</html>