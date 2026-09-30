<?php

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $file = $_FILES['avatar'];

    var_dump($file);

    // 1. Перевіряємо, чи взагалі надійшов файл і чи не було помилок під час транспортування
    if ($file['error'] === UPLOAD_ERR_OK) {

        // Валідація по розміру
        $maxSize = 20 * 1024 * 1024; // 20 Мегабайт
        if ($file['size'] > $maxSize) {
            die("Файл завеликий! Максимум 20 МБ.");
        }

        // Валідація по типу.
        // Білий список безпечних розширень:
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

        // Дістаємо "jpg" з тексту "my_photo-2023.min.jpg"
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

        if (!in_array($ext, $allowedExtensions)) {
            die("Дозволено завантажувати ТІЛЬКИ картинки (jpg, png, gif)!");
        }
        
        // Створюємо нове ім'я на основі унікального ідентифікатора часу
        $newName = uniqid('avatar_', true) . '.' . $ext;

        // 2. Звідки беремо? (Тимчасовий системний шлях)
        $tmpPath = $file['tmp_name'];

        // 3. Куди кладемо? (Наприклад, в папку uploads поруч зі скриптом)
        // ВАЖЛИВО: папка "uploads" має фізично існувати на диску до запуску!
        $destination = 'uploads/' . $newName;

        // 4. Переміщуємо
        if (move_uploaded_file($tmpPath, $destination)) {
            echo "Файл успішно збережений як: " . $destination;
        } else {
            echo "Помилка запису на диск (можливо, немає прав у папки uploads).";
        }
    } else {
        echo "Файл не було завантажено (Помилка " . $file['error'] . ")";
    }
}
?>