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
  // Додайте ще 4-6 товарів з різними цінами та категоріями
];

const container = document.getElementById("products-grid");

// Використовуємо .map() щоб перетворити масив об'єктів на масив HTML-рядків
const htmlString = products
  .map((product) => {
    return `
        <article class="product-card">
            <img src="${product.image}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p class="price">${product.price} грн</p>
            <button class="btn btn-buy" data-id="${product.id}">Купити</button>
        </article>
        <hr>
    `;
  })
  .join(""); // Об'єднуємо масив рядків в ОДИН великий текст

// Вставляємо згенерований текст на сторінку
container.innerHTML = htmlString;