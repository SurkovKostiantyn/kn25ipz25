const themeToggleBtn = document.getElementById('themeToggleBtn');
const THEME_STORAGE_KEY = 'techshop_theme';

// 1. Функція встановлення та синхронізації теми
function applyTheme(themeName) {
    const themeIcon = themeToggleBtn?.querySelector('.theme-icon');
    const themeText = themeToggleBtn?.querySelector('.theme-text');

    if (themeName === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeIcon) themeIcon.textContent = '☀️';
        if (themeText) themeText.textContent = 'Світла тема';
    } else {
        document.body.classList.remove('dark-theme');
        if (themeIcon) themeIcon.textContent = '🌙';
        if (themeText) themeText.textContent = 'Темна тема';
    }
}

// 2. Ініціалізація теми при старті сторінки (перевірка сховища та системних налаштувань ОС)
function initTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (savedTheme) {
        // Якщо користувач уже вибирав тему раніше — застосовуємо її
        applyTheme(savedTheme);
    } else {
        // Якщо вибору немає — перевіряємо системне налаштування темної теми в ОС користувача
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark ? 'dark' : 'light');
    }
}

// 3. Обробник кліку на перемикач
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const isCurrentlyDark = document.body.classList.contains('dark-theme');
        const newTheme = isCurrentlyDark ? 'light' : 'dark';

        applyTheme(newTheme);
        // Зберігаємо вибір у localStorage для довготривалої пам'яті
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    });
}

// Викликаємо ініціалізацію теми на початку роботи
initTheme();