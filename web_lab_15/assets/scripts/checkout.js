const orderForm = document.getElementById('checkoutOrderForm');

if (orderForm) {
    orderForm.addEventListener('submit', (event) => {
        // 1. Зупиняємо дефолтне перезавантаження браузера
        event.preventDefault();

        // 2. Збираємо значення форми за допомогою FormData
        const formData = new FormData(orderForm);

        const rawName = formData.get('clientName') || '';
        const rawPhone = formData.get('clientPhone') || '';
        const rawEmail = formData.get('clientEmail') || '';
        const rawPromo = formData.get('orderPromo') || '';

        // 3. Санітизація та очищення введених даних методами рядків:
        // - видаляємо пробіли з країв та прибираємо дублюючі пробіли всередині:
        const cleanName = rawName.trim().replace(/\s+/g, ' ');

        // - очищаємо номер телефону від дефісів, пробілів та дужок за допомогою RegExp:
        const cleanPhone = rawPhone.replaceAll(/[\s\(\)\-]/g, '');

        // - приводимо поштову адресу до нижнього регістру:
        const cleanEmail = rawEmail.trim().toLowerCase();

        // - нормалізуємо промокод до верхнього регістру:
        const cleanPromo = rawPromo.trim().toUpperCase();

        // 4. Перевірка валідності даних
        const isFormValid = validateCheckoutForm(cleanName, cleanPhone, cleanEmail);
        if (!isFormValid) {
            return; // якщо є помилки, припиняємо обробку
        }

        // 5. Оформлення фінального замовлення
        completeCheckoutProcess(cleanName, cleanPhone, cleanEmail, cleanPromo);
    });
}

function validateCheckoutForm(name, phone, email) {
    let isValid = true;

    // Очищаємо попередні повідомлення про помилки
    document.getElementById('nameError').textContent = '';
    document.getElementById('phoneError').textContent = '';
    document.getElementById('emailError').textContent = '';

    // 1. Валідація імені: щонайменше два слова (ім'я та прізвище) довжиною від 2 символів
    const words = name.split(' ').filter(Boolean);
    if (words.length < 2 || name.length < 5) {
        document.getElementById('nameError').textContent = "Введіть повне ім'я та прізвище (щонайменше 2 слова).";
        isValid = false;
    }

    // 2. Валідація українського мобільного номера через регулярний вираз
    const phonePattern = /^\+?380\d{9}$/;
    if (!phonePattern.test(phone)) {
        document.getElementById('phoneError').textContent = "Введіть коректний номер у форматі +380XXXXXXXXX.";
        isValid = false;
    }

    // 3. Валідація електронної пошти
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
        document.getElementById('emailError').textContent = "Введіть дійсну поштову адресу (наприклад, user@mail.com).";
        isValid = false;
    }

    return isValid;
}

function completeCheckoutProcess(name, phone, email, promo) {
    if (cart.length === 0) {
        alert("Ваш кошик порожній! Спочатку додайте товари до кошика.");
        return;
    }

    // 1. Базова вартість товарів через метод reduce()
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 2. Застосування знижки за промокодом
    let discountPercent = 0;
    if (promo === 'SALE10') {
        discountPercent = 10;
    }

    const discountAmount = Math.round(subtotal * (discountPercent / 100));
    const finalAmount = Math.max(0, subtotal - discountAmount);

    // 3. Формування підсумкового об'єкта замовлення
    const orderData = {
        customer: {
            name: name,
            phone: phone,
            email: email
        },
        // Трансформуємо елементи кошика в оптимізований масив рядків чека за допомогою map():
        items: cart.map(item => ({
            id: item.id,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
            cost: Number((item.price * item.quantity).toFixed(2))
        })),
        promoCode: promo || null,
        discountAmount: discountAmount,
        totalToPay: Number(finalAmount.toFixed(2)),
        createdAt: new Date().toISOString()
    };

    console.log("Замовлення сформовано (JSON Payload):", orderData);
    alert(`Дякуємо, ${name}! Замовлення на суму ${finalAmount} грн успішно прийнято.`);

    // Очищаємо кошик та скидаємо поля форми
    cart = [];
    updateCartSummary();
    orderForm.reset();
}