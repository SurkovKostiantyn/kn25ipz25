<?php
/**
 * ==============================================================================
 * ФАЙЛ: create.php
 * ПРИЗНАЧЕННЯ: Сторінка створення нового завдання (Лабораторні роботи №6 та №7)
 * ==============================================================================
 * 
 * Що тут відбувається (як це працює простими словами):
 * 1. Коли користувач просто переходить на цю сторінку в браузері — це GET-запит.
 *    PHP просто показує порожню форму для вводу.
 * 2. Коли користувач заповнює форму і тисне кнопку "Зберегти" — це POST-запит.
 *    Дані таємно передаються в тілі запиту і потрапляють у спеціальний масив $_POST.
 * 3. Ми очищаємо ці дані (санація) від зайвих пробілів (trim) та небезпечних тегів (htmlspecialchars).
 * 4. Перевіряємо (валідація), чи заповнені всі обов'язкові поля.
 * 5. Якщо є помилки — складаємо їх у скриньку (масив $errors) і знову показуємо форму,
 *    але НЕ пратимемо те, що користувач уже ввів (це називається "Sticky Form" / "липка форма").
 * 6. Якщо помилок немає — додаємо нове завдання у файл data.json і повертаємося на index.php.
 */

// ------------------------------------------------------------------------------
// 1. ОГОЛОШЕННЯ ЗМІННИХ ЗА ЗАМОВЧУВАННЯМ
// ------------------------------------------------------------------------------
// Створюємо змінні для збереження введених даних.
// На початку вони порожні. Якщо виникнуть помилки валідації,
// ми вставимо їх назад у поля форми, щоб користувач не вводив усе заново.
$title = '';
$description = '';
$priority = '';

// Створюємо порожній масив (список) для збору можливих помилок
$errors = [];

// Змінна для демонстрації var_dump (за бажанням можна ввімкнути для перевірки)
$debug_mode = false; 

// ------------------------------------------------------------------------------
// 2. ОБРОБКА ВІДПРАВКИ ФОРМИ (POST-ЗАПИТ)
// ------------------------------------------------------------------------------
// Перевіряємо суперглобальний масив $_SERVER:
// Яким саме методом браузер звернувся до нашого файлу?
// 'POST' означає, що користувач натиснув кнопку "Зберегти" у формі.
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // --------------------------------------------------------------------------
    // КРОК 1 (Лаба 7): САНАЦІЯ (ОЧИЩЕННЯ ТА ЗАХИСТ)
    // --------------------------------------------------------------------------
    // ?? '' — оператор об'єднання з null: якщо в $_POST чомусь немає такого ключа,
    // замість помилки PHP підставить порожній рядок ''.
    
    // trim() — видаляє "невидимі" пробіли, табуляції та переноси рядків
    // на самому початку і в самому кінці введеного тексту.
    // Наприклад: рядок "   Привіт   " перетвориться на просто "Привіт".
    $raw_title       = trim($_POST['title'] ?? '');
    $raw_description = trim($_POST['description'] ?? '');
    $raw_priority    = trim($_POST['priority'] ?? '');

    // htmlspecialchars() — це наш щит проти зловмисників (захист від XSS-атак).
    // Якщо хтось спробує ввести шкідливий код, наприклад <script>alert('Злам!');</script>,
    // ця функція перетворить символ '<' на безпечний текст '&lt;', а '>' на '&gt;'.
    // Браузер покаже це просто як текст, а не виконає як вірусну програму!
    $title       = htmlspecialchars($raw_title, ENT_QUOTES, 'UTF-8');
    $description = htmlspecialchars($raw_description, ENT_QUOTES, 'UTF-8');
    $priority    = htmlspecialchars($raw_priority, ENT_QUOTES, 'UTF-8');

    // --------------------------------------------------------------------------
    // КРОК 2 (Лаба 7): ВАЛІДАЦІЯ (ПЕРЕВІРКА НА ПРАВИЛЬНІСТЬ)
    // --------------------------------------------------------------------------
    // empty() перевіряє, чи є змінна порожньою (наприклад '' або null).
    
    // Перевірка назви:
    if (empty($title)) {
        // Додаємо текст помилки в кінець нашого списку $errors
        $errors[] = "Поле «Назва завдання» є обов'язковим для заповнення!";
    }

    // Перевірка опису:
    if (empty($description)) {
        $errors[] = "Поле «Опис завдання» є обов'язковим для заповнення!";
    }

    // Перевірка пріоритету:
    // in_array() перевіряє, чи значення є одним із дозволених варіантів.
    $allowed_priorities = ['Low', 'Medium', 'High'];
    if (empty($priority) || !in_array($priority, $allowed_priorities, true)) {
        $errors[] = "Будь ласка, оберіть коректний пріоритет: Low, Medium або High!";
    }

    // --------------------------------------------------------------------------
    // КРОК 3: ЗБЕРЕЖЕННЯ ДАНИХ (якщо помилок немає)
    // --------------------------------------------------------------------------
    // empty($errors) перевіряє: якщо наш масив помилок порожній — усе добре!
    if (empty($errors)) {
        $file = 'data.json';
        $tasks = [];

        // Перевіряємо, чи вже існує файл data.json
        if (file_exists($file)) {
            // Зчитуємо весь вміст файлу у вигляді тексту
            $json_content = file_get_contents($file);

            // Перетворюємо JSON-текст у звичайний PHP-масив.
            // Параметр true означає: перетворити об'єкти на асоціативні масиви.
            $decoded = json_decode($json_content, true);

            // Перевіряємо, чи декодування пройшло успішно і ми отримали масив
            if (is_array($decoded)) {
                $tasks = $decoded;
            }
        }

        // Додаємо нове завдання в кінець списку завдань
        $tasks[] = [
            'id'          => uniqid(), // Унікальний номер завдання
            'title'       => $title,
            'description' => $description,
            'priority'    => $priority,
            'created_at'  => date('Y-m-d H:i:s') // Дата і час створення
        ];

        // Перетворюємо масив назад у текстовий формат JSON:
        // JSON_UNESCAPED_UNICODE — щоб українські літери залишалися гарними літерами, а не \u041f...
        // JSON_PRETTY_PRINT — щоб текст у файлі був із відступами, зручний для читання людиною.
        $json_data = json_encode($tasks, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

        // Записуємо оновлені дані у файл:
        // LOCK_EX — блокує файл під час запису, щоб два користувачі не зіпсували файл одночасно.
        file_put_contents($file, $json_data, LOCK_EX);

        // Перенаправляємо користувача назад на головну сторінку index.php
        // Параметр ?created=1 повідомить головній сторінці, що все успішно збережено!
        header('Location: index.php?created=1');
        exit; // Зупиняємо виконання скрипта після перенаправлення
    }
}
?>
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Додати нове завдання — Лабораторна №6 та №7</title>
    <style>
        /* Базові стилі для гарного і сучасного вигляду сторінки */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        body {
            background-color: #f4f6f9;
            color: #333333;
            padding: 30px 15px;
            display: flex;
            justify-content: center;
        }
        .container {
            background: #ffffff;
            width: 100%;
            max-width: 600px;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            padding: 30px;
        }
        h1 {
            font-size: 24px;
            margin-bottom: 8px;
            color: #1f2937;
        }
        .subtitle {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 24px;
        }
        .back-link {
            display: inline-block;
            margin-bottom: 20px;
            color: #2563eb;
            text-decoration: none;
            font-weight: 500;
            font-size: 14px;
            transition: color 0.2s ease;
        }
        .back-link:hover {
            color: #1d4ed8;
            text-decoration: underline;
        }
        
        /* Блок повідомлень про помилки (Крок 3 Лабораторної №7) */
        .alert-danger {
            background-color: #fef2f2;
            border-left: 4px solid #ef4444;
            color: #991b1b;
            padding: 14px 18px;
            border-radius: 6px;
            margin-bottom: 22px;
            font-size: 14px;
        }
        .alert-danger strong {
            display: block;
            margin-bottom: 6px;
        }
        .alert-danger ul {
            margin-left: 20px;
        }
        .alert-danger li {
            margin-top: 4px;
        }

        /* Стилі форми */
        .form-group {
            margin-bottom: 18px;
        }
        label {
            display: block;
            margin-bottom: 6px;
            font-weight: 600;
            font-size: 14px;
            color: #374151;
        }
        label .required {
            color: #ef4444;
        }
        input[type="text"],
        textarea,
        select {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 15px;
            color: #111827;
            background-color: #ffffff;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        input[type="text"]:focus,
        textarea:focus,
        select:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
        textarea {
            min-height: 110px;
            resize: vertical;
        }
        .btn-submit {
            display: inline-block;
            width: 100%;
            background-color: #2563eb;
            color: #ffffff;
            font-size: 16px;
            font-weight: 600;
            padding: 12px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: background-color 0.2s;
            margin-top: 8px;
        }
        .btn-submit:hover {
            background-color: #1d4ed8;
        }

        /* Блок налагодження var_dump */
        .debug-box {
            margin-top: 25px;
            padding: 15px;
            background: #111827;
            color: #10b981;
            border-radius: 6px;
            font-family: monospace;
            font-size: 13px;
            overflow-x: auto;
        }
    </style>
</head>
<body>

<div class="container">

    <!-- Крок 2 Лаби 6: Посилання для повернення на головну сторінку -->
    <a href="index.php" class="back-link">← Повернутись до списку завдань</a>

    <h1>Створити нове завдання</h1>
    <p class="subtitle">Заповніть форму нижче, щоб додати задачу до вашого списку.</p>

    <!-- 
        =========================================================================
        КРОК 3 (Лабораторна №7): ВИВЕДЕННЯ ПОМИЛОК ВАЛІДАЦІЇ
        =========================================================================
        Перевіряємо, чи є в масиві $errors хоча б одна помилка.
        Якщо є (!empty($errors)) — виводимо червоне сповіщення зі списком усіх помилок.
    -->
    <?php if (!empty($errors)): ?>
        <div class="alert alert-danger">
            <strong>Ой! Виникли помилки при заповненні форми:</strong>
            <ul>
                <?php foreach ($errors as $error): ?>
                    <li><?= htmlspecialchars($error) ?></li>
                <?php endforeach; ?>
            </ul>
        </div>
    <?php endif; ?>

    <!--
        =========================================================================
        КРОК 1 (Лабораторна №6): ГОЛОВНА HTML-ФОРМА
        =========================================================================
        action="create.php" — форма відправляє дані на цей самий файл.
        method="POST" — дані передаються приховано у тілі запиту, а не у відкритому URL.
    -->
    <form action="create.php" method="POST">

        <!-- 
            Поле 1: Назва завдання 
            КРОК 4 (Лаба 7 - Sticky Form):
            Атрибут value="<?= $title ?>" повертає користувачу введений раніше текст,
            якщо виникла помилка і форма перезавантажилась.
        -->
        <div class="form-group">
            <label for="title">Назва завдання <span class="required">*</span></label>
            <input 
                type="text" 
                id="title" 
                name="title" 
                placeholder="Наприклад: Підготувати лабораторну з PHP" 
                value="<?= $title ?>"
            >
        </div>

        <!-- 
            Поле 2: Опис завдання
            КРОК 4 (Лаба 7 - Sticky Form):
            Всередину тегів <textarea> поміщаємо збережене значення $description.
        -->
        <div class="form-group">
            <label for="description">Опис завдання <span class="required">*</span></label>
            <textarea 
                id="description" 
                name="description" 
                placeholder="Детально опишіть, що саме потрібно зробити..."
            ><?= $description ?></textarea>
        </div>

        <!-- 
            Поле 3: Пріоритет (select)
            КРОК 4 (Лаба 7 - Sticky Form):
            Перевіряємо ($priority === 'Low' ? 'selected' : '') і додаємо
            атрибут selected саме до того пункту, який вибрав користувач.
        -->
        <div class="form-group">
            <label for="priority">Пріоритет <span class="required">*</span></label>
            <select id="priority" name="priority">
                <option value="" disabled <?= empty($priority) ? 'selected' : '' ?>>-- Оберіть пріоритет --</option>
                <option value="Low" <?= $priority === 'Low' ? 'selected' : '' ?>>Low (Низький)</option>
                <option value="Medium" <?= $priority === 'Medium' ? 'selected' : '' ?>>Medium (Середній)</option>
                <option value="High" <?= $priority === 'High' ? 'selected' : '' ?>>High (Високий)</option>
            </select>
        </div>

        <!-- Кнопка відправки форми (Лаба 6) -->
        <button type="submit" class="btn-submit">💾 Зберегти завдання</button>

    </form>

    <!-- 
        =========================================================================
        ДЕМОНСТРАЦІЯ var_dump() (Лабораторна №6, Крок 3)
        =========================================================================
        Якщо форму було відправлено методом POST, ми можемо переглянути
        вміст масиву $_POST для наочного пояснення викладачу, як виглядають дані.
    -->
    <?php if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($errors)): ?>
        <div class="debug-box">
            <strong>🔍 Демонстрація перехоплення даних через var_dump($_POST) (Лаба №6):</strong>
            <pre><?php var_dump($_POST); ?></pre>
        </div>
    <?php endif; ?>

</div>

</body>
</html>
