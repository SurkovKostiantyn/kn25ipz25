// ==========================================
// 1. КОНСТАНТИ ТА СТАН ДОДАТКА
// ==========================================
const CART_STORAGE_KEY = 'techshop_cart';
let allProducts = [];
let cart = loadCartFromStorage();

// Глобальний масив збережених ID улюблених товарів
const FAVORITES_STORAGE_KEY = 'techshop_favorites';
let favoriteProductIds = loadFavoritesFromStorage();

// ==========================================
// 2. DOM-ЕЛЕМЕНТИ ІНТЕРФЕЙСУ
// ==========================================
// Каталог товарів та індикатор завантаження
const container = document.getElementById("products-grid");
const loader = document.getElementById("loader");

// Пошук товарів
const searchInput = document.getElementById("searchInput");
const searchResultCount = document.getElementById("searchResultCount");

// Drag and Drop зона (обране)
const favoritesZone = document.getElementById("dragAndDropZone");

// Модальне вікно кошика та кнопки керування
const cartButton = document.querySelector(".btn-cart");
const cartOverlay = document.getElementById("cartOverlay");
const closeBtn = document.getElementById("closeCartBtn");
const clearCartBtn = document.getElementById("clearCartBtn");

// Елементи відображення кількості та суми кошика
const num = document.getElementById("num");
const total = document.getElementById("total");
const cartTotalSum = document.getElementById("cartTotalSum");
const cartItemsContainer = document.getElementById("cartItemsContainer");


// ==========================================
// ФУНКЦІЇ ЗАВАНТАЖЕННЯ ТА ІНІЦІАЛІЗАЦІЇ
// ==========================================

// Завантаження масиву ID улюблених товарів зі сховища
function loadFavoritesFromStorage() {
  try {
    const rawData = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return rawData ? JSON.parse(rawData) : [];
  } catch (error) {
    console.error('Помилка завантаження Favorites:', error);
    return [];
  }
}

// Збереження масиву ID улюблених товарів у сховище
function saveFavoritesToStorage() {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteProductIds));
  } catch (error) {
    console.error('Помилка збереження Favorites:', error);
  }
}

// Функція завантаження товарів із сервера
async function fetchProducts() {
  try {
    const response = await fetch(
      "https://fakestoreapi.com/products?limit=20",
    );

    if (!response.ok) {
      throw new Error(`HTTP помилка: ${response.status}`);
    }

    const realProducts = await response.json();
    return realProducts;
  } catch (error) {
    console.error("Помилка завантаження товарів:", error.message);
    throw error;
  }
}

async function initShop() {
  if (loader) loader.classList.remove("hidden");
  if (container) container.innerHTML = "";

  renderFavoritesZone();

  try {
    const data = await fetchProducts();
    allProducts = data;

    if (loader) loader.classList.add("hidden");

    renderProducts(data);
    renderFavoritesZone();
  } catch (error) {
    if (loader) loader.classList.add("hidden");
    if (container) container.innerHTML = `<p class="error">Помилка: ${error.message}</p>`;
  }
}

initShop();

// Рендеринг карток товарів
function renderProducts(products) {
  if (!container) return;
  if (!products || products.length === 0) {
    container.innerHTML = '<p class="no-products">Товарів не знайдено</p>';
    return;
  }
  container.innerHTML = products.map(product => `
    <article class="product-card" draggable="true" data-id="${product.id}">
      <img src="${product.image}" alt="${product.title}" draggable="false">
      <h3>${product.title}</h3>
      <p class="price">${product.price} $</p>
      <button class="btn btn-buy" data-id="${product.id}">Купити</button>
    </article>
  `).join('');
}

// Функція візуального відображення зони улюбленого (Drag and Drop)
function renderFavoritesZone() {
  const zone = favoritesZone || document.getElementById('dragAndDropZone');
  if (!zone) return;

  if (!favoriteProductIds || favoriteProductIds.length === 0) {
    zone.innerHTML = '<p class="empty-fav" style="padding: 50px 10px; color: #888; font-size: 16px;">Перетягніть сюди товар для додавання в Обране</p>';
    return;
  }

  // Знаходимо повні об'єкти товарів із каталогу (якщо товари ще не завантажилися, показуємо збережені ID)
  const favoriteItems = allProducts.length > 0
    ? allProducts.filter(product => favoriteProductIds.includes(product.id))
    : favoriteProductIds.map(id => ({ id, title: `Товар #${id}`, price: '' }));

  zone.innerHTML = `
    <h4 style="margin: 10px 0;">Обрані товари (${favoriteProductIds.length}):</h4>
    <div class="fav-chips" style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; padding: 10px;">
      ${favoriteItems.map(item => `
        <span class="fav-chip" style="background: #fff; border: 1px solid #ff9800; padding: 6px 12px; border-radius: 20px; font-size: 13px; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <strong>${item.title.substring(0, 25)}${item.title.length > 25 ? '...' : ''}</strong>
          ${item.price ? `<span style="color: #28a745; font-weight: bold;">${item.price} $</span>` : ''}
          <button class="btn-remove-fav" data-id="${item.id}" title="Видалити" style="border:none; background:none; cursor:pointer; color:red; font-size: 16px; font-weight: bold; line-height: 1;">×</button>
        </span>
      `).join('')}
    </div>
  `;
}


// ==========================================
// ПОШУК ТА ФІЛЬТРАЦІЯ ТОВАРІВ
// ==========================================

if (searchInput) {
  searchInput.addEventListener('input', (event) => {
    const searchQuery = event.target.value.trim().toLowerCase();

    const matchedProducts = allProducts.filter(product => {
      return product.title.toLowerCase().includes(searchQuery);
    });

    if (searchResultCount) {
      if (searchQuery.length > 0) {
        searchResultCount.textContent = `Знайдено товарів: ${matchedProducts.length}`;
      } else {
        searchResultCount.textContent = '';
      }
    }

    renderProducts(matchedProducts);
  });
}


// ==========================================
// ОБРОБКА КЛІКІВ ТА DRAG AND DROP
// ==========================================

if (container) {
  // Клік на кнопку "Купити"
  container.addEventListener("click", function (event) {
    const buyBtn = event.target.closest('.btn-buy');
    if (buyBtn) {
      const productId = Number(buyBtn.dataset.id);
      addToCart(productId);

      // Візуальний відгук на кнопці
      const originalText = buyBtn.textContent;
      buyBtn.textContent = 'Додано! ✓';
      buyBtn.style.backgroundColor = '#28a745';
      buyBtn.style.color = '#fff';
      setTimeout(() => {
        buyBtn.textContent = originalText;
        buyBtn.style.backgroundColor = '';
        buyBtn.style.color = '';
      }, 700);
    }
  });

  // Початок перетягування (Drag Start)
  container.addEventListener('dragstart', (event) => {
    const card = event.target.closest('.product-card');
    if (card) {
      event.dataTransfer.setData('text/plain', card.dataset.id);
      card.classList.add('dragging');
    }
  });

  // Кінець перетягування (Drag End)
  container.addEventListener('dragend', (event) => {
    const card = event.target.closest('.product-card');
    if (card) {
      card.classList.remove('dragging');
    }
  });
}

// Зона прийому перетягування (Drop Zone)
if (favoritesZone) {
  favoritesZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    favoritesZone.classList.add('drag-over');
  });

  favoritesZone.addEventListener('dragleave', () => {
    favoritesZone.classList.remove('drag-over');
  });

  favoritesZone.addEventListener('drop', (event) => {
    event.preventDefault();
    favoritesZone.classList.remove('drag-over');

    const productId = Number(event.dataTransfer.getData('text/plain'));

    if (productId && !favoriteProductIds.includes(productId)) {
      favoriteProductIds.push(productId);
      saveFavoritesToStorage();
      renderFavoritesZone();
    }
  });

  // Видалення товару з улюбленого за кліком на хрестик
  favoritesZone.addEventListener('click', (event) => {
    const removeBtn = event.target.closest('.btn-remove-fav');
    if (removeBtn) {
      const idToRemove = Number(removeBtn.dataset.id);
      favoriteProductIds = favoriteProductIds.filter(id => id !== idToRemove);
      saveFavoritesToStorage();
      renderFavoritesZone();
    }
  });
}

// Очищення кошика за кнопкою
if (clearCartBtn) {
  clearCartBtn.addEventListener('click', () => {
    clearCart();
  });
}

// Оновлення підсумків кошика та зони улюбленого при старті
document.addEventListener('DOMContentLoaded', () => {
  updateCartSummary();
  renderFavoritesZone();
});


// ==========================================
// ЛОГІКА КОШИКА ТА LOCALSTORAGE
// ==========================================

// Додавання товару в кошик
function addToCart(productOrId) {
  const productId = typeof productOrId === 'object' && productOrId !== null ? productOrId.id : Number(productOrId);
  const product = allProducts.find(item => item.id === productId);
  if (!product) return;

  const existingCartItem = cart.find(item => item.id === product.id);

  if (existingCartItem) {
    existingCartItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }

  saveCartToStorage();
  updateCartSummary();
  updateUI();
}

// Зміна кількості товару в кошику (+1 або -1)
function changeCartQuantity(productId, delta) {
  const itemIndex = cart.findIndex(item => item.id === Number(productId));
  if (itemIndex === -1) return;

  cart[itemIndex].quantity += delta;

  if (cart[itemIndex].quantity <= 0) {
    cart.splice(itemIndex, 1);
  }

  saveCartToStorage();
  updateCartSummary();
  updateUI();
}

// Повне очищення кошика
function clearCart() {
  cart = [];
  localStorage.removeItem(CART_STORAGE_KEY);
  updateCartSummary();
  updateUI();
}

// Розрахунок загальної суми та кількості в кошику
function updateCartSummary() {
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotalSum = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (cartTotalSum) cartTotalSum.textContent = `${subtotalSum.toFixed(2)} грн`;
  if (num) num.textContent = totalItems;
  if (total) total.textContent = subtotalSum.toFixed(2);

  return subtotalSum;
}

function calculateTotal() {
  const sum = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  return Number(sum.toFixed(2));
}

// Оновлення списку товарів у модальному вікні кошика
function updateUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (num) num.textContent = totalItems;
  if (total) total.textContent = calculateTotal();

  if (cartItemsContainer) {
    cartItemsContainer.innerHTML = "";
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p style="text-align: center; color: #888; padding: 20px;">Кошик порожній</p>';
      return;
    }

    cart.forEach((element) => {
      const cartItem = document.createElement("div");
      cartItem.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #eee;";
      cartItem.innerHTML = `
        <span style="flex: 1; margin-right: 10px;">${element.title}</span>
        <span><b>x${element.quantity}</b> | ${(element.price * element.quantity).toFixed(2)} грн</span>
      `;
      cartItemsContainer.appendChild(cartItem);
    });
  }
}


// ==========================================
// МОДАЛЬНЕ ВІКНО КОШИКА
// ==========================================

function openCartModal() {
  if (cartOverlay) {
    cartOverlay.classList.remove("hidden");
  }
  updateUI();
}

function closeCartModal() {
  if (cartOverlay) {
    cartOverlay.classList.add("hidden");
  }
}

if (cartButton) cartButton.addEventListener("click", openCartModal);
if (closeBtn) closeBtn.addEventListener("click", closeCartModal);

if (cartOverlay) {
  cartOverlay.addEventListener("click", (event) => {
    if (event.target === cartOverlay) {
      closeCartModal();
    }
  });
}


// ==========================================
// СИНХРОНІЗАЦІЯ З LOCALSTORAGE
// ==========================================

function loadCartFromStorage() {
  try {
    const rawData = localStorage.getItem(CART_STORAGE_KEY);
    if (!rawData) return [];
    const parsedCart = JSON.parse(rawData);
    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch (error) {
    console.error('Помилка парсингу кошика з localStorage:', error);
    localStorage.removeItem(CART_STORAGE_KEY);
    return [];
  }
}

function saveCartToStorage() {
  try {
    const serializedData = JSON.stringify(cart);
    localStorage.setItem(CART_STORAGE_KEY, serializedData);
  } catch (error) {
    console.error('Помилка збереження кошика у Web Storage:', error);
  }
}
