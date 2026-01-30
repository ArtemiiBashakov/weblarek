import "./scss/styles.scss";
import { MainCatalogModel } from "./components/Models/MainCatalog";
import { CartModel } from "./components/Models/Cart";
import { CustomerModel } from "./components/Models/Customer";
import { apiProducts } from "./utils/data";
import { Api } from "./components/base/Api";
import { ApiService } from "./components/Models/ApiService";
import { API_URL } from "./utils/constants";

// Проверка MainCatalogModel и его методов
const catalog = new MainCatalogModel(apiProducts.items);
console.log("Это вывод всего каталога", catalog.catalogProducts);
catalog.selectedProduct = "854cef69-976d-4c2a-a18c-2aa45046c390";
console.log("Это вывод выбранного продукта", catalog.selectedProduct);
console.log(
  "Это вывод продукта, найденного по id",
  catalog.getProductById("c101ab44-ed99-4a54-990d-47aa2bb4e7d9"),
);
//Проверка CartModel и его методов
const cart = new CartModel();
cart.putItemsInCart(
  apiProducts.items[1],
  apiProducts.items[2],
  apiProducts.items[3],
);
console.log(
  "Это проверка функции, способной положить сразу несколько товаров в коризну. Товар с ценой null не положен и вылезла ошибка",
  cart.itemsInCart,
);
cart.deleteItemFromCart(cart.itemsInCart[1]);
console.log("Проверка функции, удаляющей товар", cart.itemsInCart);
cart.clearCart();
console.log("Проверка функции, очищающей корзину", cart.itemsInCart);
cart.putItemsInCart(...apiProducts.items);
console.log(
  "Проверка функции отображения числа товаров в корзине. Снова вылезет ошибка: товар с ценой null не попадет в корзину",
  cart.productsCount(),
);
console.log(
  "Проверка функции, отображающей общую стоимость товаров в корзине",
  cart.totalPrice(),
);
console.log(
  "Проверка поиска товара в корзине по id",
  cart.getItemById("854cef69-976d-4c2a-a18c-2aa45046c390"),
);
console.log(
  "Проверка наличия товара в корзине по id но возвращает булевое значение. В данном случае товар с ценой null в корзину не попал",
  cart.hasItem("b06cde61-912f-4663-9751-09956c0eed67"),
);
//Проверка CustomerModel
const customer = new CustomerModel();
customer.customerData = {
  payment: "online",
  email: "super@email.com",
  phone: "8999887766",
  address: "Ul. Lenina 7",
};
console.log(
  "Проверка геттера для общих данных пользователя",
  customer.customerData,
);
console.log("Проверка для отдельных полей пользователя", customer.payment);
console.log("Проверка для отдельных полей пользователя", customer.email);
console.log("Проверка для отдельных полей пользователя", customer.phone);
console.log("Проверка для отдельных полей пользователя", customer.address);
customer.clearСustomerData();
console.log("Проверка очистки данных пользователя", customer.customerData);
customer.customerData = {
  payment: "online",
  email: "partyanimal@email.com",
  phone: "88887776655",
  address: "pravdy 1",
};
console.log("Проверка функции валидации", customer.validate());
console.log(
  "Отдельный вызов массива ошибок валидации",
  customer.validationErrors,
);
console.log(
  "Отдельный вызов булевого значения, отвечающего за валидность всех данных",
  customer.isComplete,
);
//Проверка ApiService
const api = new Api(API_URL);
const apiService = new ApiService(api);
//Функция загрузки товаров, полученных из get-запроса, и сразу помещения их в каталог
async function loadProducts() {
  try {
    catalog.catalogProducts = await apiService.getProducts();
    console.log("Каталог загружен:Товары:", catalog.catalogProducts);
  } catch (error) {
    console.error("Не удалось загрузить товары:", error);
  }
}
loadProducts();
//Проверка работы классов с принятыми из сервера данными
async function workWithServerData() {
  await loadProducts();
  catalog.selectedProduct = "90973ae5-285c-4b6f-a6d0-65d1d760b102";
  console.log(catalog.selectedProduct);
  cart.clearCart();
  cart.putItemsInCart(catalog.catalogProducts[5], catalog.catalogProducts[7]);
  console.log(cart.itemsInCart);
  cart.deleteItemFromCart(cart.itemsInCart[1]);
  console.log(cart.itemsInCart);
  console.log(cart.totalPrice());
  console.log(cart.productsCount());
}
workWithServerData();
//Функция отправки данных пользователя и данных о заказе, собранных из корзины. Выводит id post-запроса на сервер и общую сумму заказа
async function sendOrderExample() {
  try {
    const orderResponse = await apiService.postOrder({
      customer: customer.customerData,
      cart: cart.itemsInCart,
    });
    console.log("Заказ создан:", orderResponse);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Ошибка создания заказа:", error.message);
    } else {
      console.error("Неизвестная ошибка:", error);
    }
  }
}
sendOrderExample();
