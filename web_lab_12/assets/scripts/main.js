const products = [
  {
    id: 1,
    title: "Ноутбук Apple MacBook Pro 16",
    price: 99999,
    category: "laptops",
    image: "https://picsum.photos/300/200",
  },
  {
    id: 2,
    title: "Смартфон Samsung Galaxy S24",
    price: 39999,
    category: "smartphones",
    image: "https://picsum.photos/300/200",
  },
  {
    id: 3,
    title: "Планшет Apple iPad Pro",
    price: 49999,
    category: "tablets",
    image: "https://picsum.photos/300/200",
  },
  {
    id: 4,
    title: "Навушники Sony WH-1000XM4",
    price: 8999,
    category: "headphones",
    image: "https://picsum.photos/300/200",
  }
  // Додайте ще 4-6 товарів з різними цінами та категоріями
];

let cart = []; // пуста змінна для зберігання товарів у кошику

const container = document.getElementById("products-grid");

function fetchProducts() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Штучно симулюємо успішну відповідь від сервера
      resolve(products);

      // Можна також симулювати помилку розкоментувавши рядок нижче:
      // reject(new Error("Не вдалося підключитися до бази даних"));
    }, 500); // 2.5 секунди затримки
  });
}

async function initShop() {
  const loader = document.getElementById("loader");
  const container = document.querySelector(".products-grid");

  // 1. Показуємо спінер (він і так видимий по замовчуванню, але переконаємось)
  loader.classList.remove("hidden");
  container.innerHTML = ""; // Очищаємо сітку

  try {
    // 2. ЧЕКАЄМО 2.5 секунди на "відповідь сервера"
    const data = await fetchProducts();

    // 3. Сервер відповів (успіх)! Ховаємо спінер
    loader.classList.add("hidden");

    // 4. Малюємо карточки товарів (як у ПР №9)
    const htmlString = data
      .map(
        (product) => `
          <article class="product-card">
            <img src="${product.image}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p class="price">${product.price} грн</p>
            <button class="btn btn-buy" data-id="${product.id}">Купити</button>
        </article>
        <hr>
        `,
      )
      .join("");

    container.innerHTML = htmlString;
  } catch (error) {
    // Якщо сталася помилка сервера (reject)
    loader.classList.add("hidden");
    container.innerHTML = `<p class="error">Помилка: ${error.message}</p>`;
  }
}

initShop();

container.addEventListener("click", function (event) {
  // обробка кліку на кнопки "Купити"
  // console.log(event.target); // перевіряємо, на що саме клікнули

  // console.log(event.target.classList); // перевіряємо, які класи має елемент, на який клікнули

  if (event.target.classList.contains("btn-buy")) {
    // виведемо в консоль тестово id товару, який клікнули
    const productId = Number(event.target.dataset.id);
    const selectedProduct = products.find(p => p.id === productId);
    addToCart(selectedProduct);

  }

});

// Функція для додавання товару в кошик

function addToCart(product) {
  // Перевіряємо (через метод find) чи існує вже такий товар
  const existingItem = cart.find(item => item.id === product.id);

  if (existingItem) {
    // Якщо товар вже в кошику, просто збільшуємо кількість у властивості `quantity`
    existingItem.quantity += 1;
  } else {
    // Інакше додаємо новий об'єкт у масив, встановлюючи початкову кількість = 1 (Spread оператор)
    cart.push({ ...product, quantity: 1 });
  }

  updateUI(); // Викликаємо оновлення екрану
}

// рахуємо загальну суму кошика

function calculateTotal() {
  return cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
}

// функція для оновлення UI (інтерфейсу користувача)

function updateUI() {

  const num = document.getElementById("num");
  const total = document.getElementById("total");

  // Практично так само метод reduce для рахунку загальної кількості товарів (включаючи > 1 одного типу)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  num.textContent = totalItems;
  total.textContent = calculateTotal();

  const cartItemsContainer = document.getElementById("cartItemsContainer");

  cartItemsContainer.innerHTML = "";
  cart.forEach((element) => {
    const cartItem = document.createElement("div");
    cartItem.innerHTML =
      `<p> ${element.title} x${element.quantity} | ${element.price * element.quantity} грн </p>`;
    cartItemsContainer.appendChild(cartItem);
  });

}

const cartButton = document.querySelector(".btn-cart"); // Ваша кнопка в Header з SVG (ПР №7)
const cartOverlay = document.getElementById("cartOverlay");
const closeBtn = document.getElementById("closeCartBtn");

// Функція відкриття
function openCartModal() {
  cartOverlay.classList.remove("hidden");
  renderCartItems(); // Оновлюємо список перед тим як показати
}

// Функція закриття
function closeCartModal() {
  cartOverlay.classList.add("hidden");
}

// Вішаємо слухачі
cartButton.addEventListener("click", openCartModal);
closeBtn.addEventListener("click", closeCartModal);

// Закриття кліком по темному фону (оверлею) повз вікно
cartOverlay.addEventListener("click", (event) => {
  if (event.target === cartOverlay) {
    closeCartModal();
  }
});