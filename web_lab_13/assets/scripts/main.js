let globalStoreProducts = [];
let cart = []; // пуста змінна для зберігання товарів у кошику

const container = document.getElementById("products-grid");

// Нова функція завантаження:
async function fetchProducts() {
  try {
    // 1. Надсилаємо мережевий GET-запит
    const response = await fetch(
      "https://fakestoreapi.com/products?limit=2",
    );

    // 2. Перевіряємо чи статус відповіді ОК (200-299)
    if (!response.ok) {
      throw new Error(`HTTP помилка: ${response.status}`);
    }

    // 3. Розпаковуємо тіло відповіді з JSON у звичайний масив JavaScript
    const realProducts = await response.json();

    // Розкоментуйте, щоб побачити масив у консолі:
    console.log("Дані з сервера:", realProducts);

    // Повертаємо масив, щоб ним міг скористатися initShop()
    return realProducts;
  } catch (error) {
    console.error("Помилка завантаження товарів:", error.message);
    // Прокидаємо помилку далі, щоб спінер зник і користувач побачив "Помилка мережі"
    throw error;
  }
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

    globalStoreProducts = data;

    // 3. Сервер відповів (успіх)! Ховаємо спінер
    loader.classList.add("hidden");

    // 4. Малюємо карточки товарів (як у ПР №9)
    const htmlString = data
      .map(
        (product) => `
          <article class="product-card">
            <img src="${product.image}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p>Категорія: ${product.category}</p>
            <p>Рейтинг: ${product.rating.rate}</p>
            <p>Опис: ${product.description}</p>
            <p class="price">${product.price} $</p>
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
    const selectedProduct = globalStoreProducts.find(p => p.id === productId);
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
  //renderCartItems(); // Оновлюємо список перед тим як показати
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