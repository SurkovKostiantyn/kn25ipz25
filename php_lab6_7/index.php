<?php
/**
 * ==============================================================================
 * ФАЙЛ: index.php
 * ПРИЗНАЧЕННЯ: Головна сторінка зі списком завдань (Лабораторна №6 та №7)
 * ==============================================================================
 * 
 * Що тут відбувається (простими словами):
 * 1. Ми визначаємо, де лежить наш файл бази даних (data.json).
 * 2. Перевіряємо, чи такий файл існує на комп'ютері.
 * 3. Якщо існує — читаємо з нього текст і перетворюємо його на звичайний PHP-масив.
 * 4. Показуємо красиву веб-сторінку:
 *    - Вгорі є кнопка-посилання "➕ Додати нове завдання", яка веде на create.php (Лаба №6, Крок 2).
 *    - Якщо користувач щойно зберіг завдання, ми показуємо зелене віконечко успіху.
 *    - Нижче виводимо всі завдання по черзі через цикл foreach.
 */

// Ім'я файлу, де зберігаються всі наші збережені завдання
$file = 'data.json';

// За замовчуванням список завдань порожній
$tasks = [];

// ------------------------------------------------------------------------------
// ЗЧИТУВАННЯ ДАНИХ З ФАЙЛУ
// ------------------------------------------------------------------------------
// file_exists() перевіряє, чи файл фізично існує на диску.
// Це рятує нас від неприємної помилки Warning, якщо запустити програму вперше,
// коли файлу data.json ще взагалі немає.
if (file_exists($file)) {
    // file_get_contents() зчитує весь текст із файлу в одну текстову змінну
    $content = file_get_contents($file);

    // json_decode() розшифровує текстовий формат JSON у звичний PHP-масив.
    // Другий параметр true вказує створити саме асоціативний масив (з ключами-словами).
    $decoded = json_decode($content, true);

    // Переконуємося, що в файлі був дійсно правильний масив (а не порожній файл чи сміття)
    if (is_array($decoded)) {
        $tasks = $decoded;
    }
}

// Перевіряємо GET-параметр у посиланні:
// Якщо користувача перенаправило з create.php?created=1 — покажемо повідомлення про успіх!
$is_created = isset($_GET['created']) && $_GET['created'] === '1';
?>
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Список завдань — Лабораторна №6 та №7</title>
    <style>
        /* Базові стилі для чистого і привабливого дизайну */
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
            max-width: 750px;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            padding: 30px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            flex-wrap: wrap;
            gap: 12px;
        }
        h1 {
            font-size: 26px;
            color: #1f2937;
        }

        /* 
            Крок 2 Лаби 6: Кнопка переходу на сторінку створення завдання.
            Вище списку завдань робимо зручне посилання на create.php.
        */
        .btn-add {
            display: inline-block;
            background-color: #2563eb;
            color: #ffffff;
            text-decoration: none;
            padding: 10px 18px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            transition: background-color 0.2s, transform 0.1s;
        }
        .btn-add:hover {
            background-color: #1d4ed8;
            transform: translateY(-1px);
        }

        /* Повідомлення про успішне додавання завдання */
        .alert-success {
            background-color: #ecfdf5;
            border-left: 4px solid #10b981;
            color: #065f46;
            padding: 12px 16px;
            border-radius: 6px;
            margin-bottom: 20px;
            font-size: 14px;
            font-weight: 500;
        }

        /* Блок, коли завдань ще немає */
        .empty-state {
            text-align: center;
            padding: 50px 20px;
            color: #6b7280;
            background: #f9fafb;
            border: 2px dashed #e5e7eb;
            border-radius: 8px;
            margin-top: 10px;
        }
        .empty-state p {
            margin-bottom: 15px;
            font-size: 16px;
        }

        /* Картка окремого завдання */
        .task-card {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 18px 20px;
            margin-bottom: 14px;
            transition: box-shadow 0.2s, border-color 0.2s;
        }
        .task-card:hover {
            border-color: #cbd5e1;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        }
        .task-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
            gap: 10px;
        }
        .task-title {
            font-size: 18px;
            font-weight: 700;
            color: #111827;
            word-break: break-word;
        }
        .task-description {
            font-size: 14px;
            color: #4b5563;
            line-height: 1.5;
            margin-bottom: 12px;
            word-break: break-word;
        }
        .task-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #9ca3af;
        }

        /* Бейджі для пріоритету (Low, Medium, High) */
        .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .badge-low {
            background-color: #d1fae5;
            color: #065f46;
        }
        .badge-medium {
            background-color: #fef3c7;
            color: #92400e;
        }
        .badge-high {
            background-color: #fee2e2;
            color: #991b1b;
        }
    </style>
</head>
<body>

<div class="container">

    <div class="header">
        <h1>📋 Менеджер завдань</h1>
        <!-- 
            КРОК 2 (Лабораторна №6): Зв’язок сторінок між собою.
            Вище списку завдань розміщено посилання на сторінку створення форми: create.php
        -->
        <a href="create.php" class="btn-add">➕ Додати нове завдання</a>
    </div>

    <!-- Повідомлення про успішне збереження нового завдання -->
    <?php if ($is_created): ?>
        <div class="alert-success">
            ✅ Чудово! Ваше завдання успішно додано до списку.
        </div>
    <?php endif; ?>

    <!-- 
        Перевіряємо, чи є взагалі якісь завдання.
        empty($tasks) поверне true, якщо масив порожній.
    -->
    <?php if (empty($tasks)): ?>
        <div class="empty-state">
            <p>У вас поки що немає жодного завдання.</p>
            <a href="create.php" class="btn-add">Створити перше завдання зараз</a>
        </div>
    <?php else: ?>
        <!-- 
            Цикл foreach проходить по кожному завданню з нашого масиву $tasks.
            Змінна $task на кожному кроці містить одне завдання з полями:
            title, description, priority, created_at.
        -->
        <?php foreach ($tasks as $task): ?>
            <div class="task-card">
                <div class="task-header">
                    <!-- Захист від XSS через htmlspecialchars() при виведенні назви -->
                    <h2 class="task-title"><?= htmlspecialchars($task['title'] ?? '') ?></h2>
                    
                    <!-- Визначення бейджа пріоритету -->
                    <?php
                        $priority = $task['priority'] ?? 'Low';
                        $badgeClass = 'badge-low';
                        if ($priority === 'High') {
                            $badgeClass = 'badge-high';
                        } elseif ($priority === 'Medium') {
                            $badgeClass = 'badge-medium';
                        }
                    ?>
                    <span class="badge <?= $badgeClass ?>"><?= htmlspecialchars($priority) ?></span>
                </div>

                <!-- 
                    nl2br() перетворює звичайні переноси рядків (\n) на HTML-теги <br>,
                    щоб опис відображався красиво абзацами так, як його ввів користувач.
                -->
                <p class="task-description"><?= nl2br(htmlspecialchars($task['description'] ?? '')) ?></p>

                <div class="task-footer">
                    <span>Пріоритет: <strong><?= htmlspecialchars($priority) ?></strong></span>
                    <?php if (!empty($task['created_at'])): ?>
                        <span>Створено: <?= htmlspecialchars($task['created_at']) ?></span>
                    <?php endif; ?>
                </div>
            </div>
        <?php endforeach; ?>
    <?php endif; ?>

</div>

</body>
</html>