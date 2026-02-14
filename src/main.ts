import "./scss/styles.scss";
import { MainCatalogModel } from "./components/Models/MainCatalog";
import { CartModel } from "./components/Models/Cart";
import { CustomerModel } from "./components/Models/Customer";
import { Api } from "./components/base/Api";
import { ApiService } from "./components/Models/ApiService";
import { API_URL } from "./utils/constants";
import { cloneTemplate } from "./utils/utils";
import { CDN_URL } from "./utils/constants";
import { IProduct } from "./types";
import { TPayment } from "./types";

import { ensureElement } from "./utils/utils";
import { EventEmitter } from "./components/base/Events";
import { Header } from "./View/Header";
import { Gallery } from "./View/Gallery";
import { Modal } from "./View/Modal";
import { CardBasket } from "./View/CardBasket";
import { CardCatalog } from "./View/CardCatalog";
import { CardPreview } from "./View/CardPreview";
import { OrderForm } from "./View/OrderForm";
import { ContactsForm } from "./View/ContactsForm";
import { Basket } from "./View/Basket";
import { Success } from "./View/Success";
import { IOrderRequest } from "./types";
// Инициализация
const events = new EventEmitter();
const api = new Api(API_URL);
const apiService = new ApiService(api);
const catalog = new MainCatalogModel(events);
const cart = new CartModel(events);
const customer = new CustomerModel(events);

// Создание View компонентов
const header = new Header(events, ensureElement<HTMLElement>(".header"));
const gallery = new Gallery(ensureElement<HTMLElement>(".gallery"));
const modal = new Modal(ensureElement<HTMLElement>("#modal-container"), events);

// Шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>("#card-catalog");
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>("#card-preview");
const cardBasketTemplate = ensureElement<HTMLTemplateElement>("#card-basket");
const basketTemplate = ensureElement<HTMLTemplateElement>("#basket");
const orderTemplate = ensureElement<HTMLTemplateElement>("#order");
const contactsTemplate = ensureElement<HTMLTemplateElement>("#contacts");
const successTemplate = ensureElement<HTMLTemplateElement>("#success");
// ============ СОЗДАНИЕ КОМПОНЕНТОВ ============
const basket = new Basket(cloneTemplate(basketTemplate), events);
const preview = new CardPreview(cloneTemplate(cardPreviewTemplate), {
  onClick: () => events.emit("preview:toggle"),
}); //  Одно событие для переключения
const orderForm = new OrderForm(cloneTemplate(orderTemplate), events);
const contactsForm = new ContactsForm(cloneTemplate(contactsTemplate), events);
const success = new Success(cloneTemplate(successTemplate), events);

// ПОДПИСКИ НА СОБЫТИЯ
events.on("catalog:changed", () => {
  const items = catalog.catalogProducts.map((item) => {
    const card = new CardCatalog(cloneTemplate(cardCatalogTemplate), {
      onClick: () => {
        catalog.selectedProduct = item; // ← модель сама эмитит catalog:selected
      },
    });

    // Добавляем CDN_URL к изображению
    const cardData = {
      ...item,
      id: item.id,
      image: `${CDN_URL}${item.image}`, // ← ВОТ ЭТО ВАЖНО!
    };

    return card.render(cardData);
  });
  gallery.render({ catalog: items });
});

// СОБЫТИЕ ОБНОВЛЕНИЯ КОРЗИНЫ - ПЕРЕСБОРКА СПИСКА
let processingBasketChange = false;
//Разрешение тогглинга
let toggling = false;

events.on("basket:changed", () => {
  // Защита от рекурсии
  if (processingBasketChange) {
    return;
  }

  processingBasketChange = true;

  // Обновляем счетчик
  const count = cart.productsCount();
  header.counter = count; // ← теперь должно работать
  // Пересобираем карточки товаров
  const basketItems = cart.itemsInCart.map((item, index) => {
    const card = new CardBasket(cloneTemplate(cardBasketTemplate), {
      onClick: () => {
        events.emit("basket:remove", item);
      },
    });
    return card.render({
      title: item.title,
      price: item.price || 0,
      index: index + 1,
    });
  });
  // Обновляем данные корзины
  basket.render({
    items: basketItems,
    total: cart.totalPrice(),
  });
  //  Обновляем отображение ТОЛЬКО если открыта корзина, а не Success
  if (modal.isOpen && document.querySelector(".basket")) {
    modal.render({ content: basket.render() });
  }

  // Сбрасываем флаг через setTimeout, чтобы избежать рекурсии
  setTimeout(() => {
    processingBasketChange = false;
  }, 0);
});

events.on("catalog:selected", () => {
  // Получаем текущий выбранный продукт из модели
  const item = catalog.selectedProduct;
  if (!item) return;

  // Проверяем наличие в корзине
  const isInCart = cart.hasItem(item.id);

  // Меняем текст кнопки в зависимости от наличия
  preview.buttonText = isInCart ? "Удалить из корзины" : "В корзину";
  preview.buttonDisabled = item.price === null; // Бесценные товары всегда заблокированы

  // Рендерим данные
  preview.render({
    ...item,
    image: `${CDN_URL}${item.image}`,
    price: item.price,
  });

  // Показываем модалку
  modal.render({ content: preview.render() });
  modal.open();
});

events.on("preview:toggle", () => {
  if (toggling) return;
  toggling = true;
  const item = catalog.selectedProduct;
  if (!item || item.price === null) return; // Бесценные товары игнорируем

  if (cart.hasItem(item.id)) {
    // Если товар в корзине - удаляем
    cart.deleteItemFromCart(item);
  } else {
    // Если товара нет в корзине - добавляем
    cart.putItemInCart(item);
  }
  // Закрываем модалку после действия
  modal.close();
  setTimeout(() => {
    toggling = false;
  }, 300);
});

events.on("customer:changed", () => {
  const validation = customer.validate();

  // Обновляем валидацию формы заказа (если она открыта)
  const isOrderValid = !!(customer.payment && customer.address);
  orderForm.valid = isOrderValid;
  orderForm.errors =
    validation.errors.payment || validation.errors.address || "";

  // Обновляем валидацию формы контактов (если она открыта)
  const isContactsValid = !!(customer.email && customer.phone);
  contactsForm.valid = isContactsValid;
  contactsForm.errors =
    validation.errors.email || validation.errors.phone || "";

});
// СОБЫТИЕ ОТКРЫТИЯ КОРЗИНЫ - ТОЛЬКО РЕНДЕР
events.on("basket:open", () => {
  // Просто рендерим существующий basket с текущими данными
  modal.render({ content: basket.render() });
  modal.open();
});
// Обработчик удаления из корзины
// Слушаем СОБЫТИЕ ОТ VIEW (клик по кнопке удаления)
//  ПРИ УДАЛЕНИИ - только меняем модель, остальное сделает basket:changed
events.on("basket:remove", (item: IProduct) => {
  cart.deleteItemFromCart(item); // модель сама эмитит basket:changed
});
// Загрузка данных
apiService
  .getProducts()
  .then((products) => {
    catalog.catalogProducts = products;
  })
  .catch(console.error);

events.on("basket:order", () => {
  // Обновляем данные формы из модели
  orderForm.payment = customer.payment;
  orderForm.address = customer.address;
  // Проверяем валидность на основе данных в модели
  const isOrderValid = !!(customer.payment && customer.address);
  
  orderForm.valid = isOrderValid;
  orderForm.errors = isOrderValid ? "" : "Заполните все поля";

  // Показываем модалку с существующей формой
  modal.render({ content: orderForm.render() });
  modal.open();
});

// ============ ФОРМА ЗАКАЗА (адрес/оплата) ============

// Обработчик изменения способа оплаты
events.on("order.payment:change", (data: { payment: string }) => {
  let paymentValue: TPayment;
  if (data.payment === "card") paymentValue = "online";
  else if (data.payment === "cash") paymentValue = "При получении";
  else paymentValue = data.payment as TPayment;

  customer.customerData = { payment: paymentValue };
});

events.on("order.address:change", (data: { address: string }) => {
  customer.customerData = { address: data.address };
});

events.on("order:validate", (data: { isValid: boolean; errors: any }) => {
  if (orderForm) {
    orderForm.valid = data.isValid;
    // Показываем ошибку для текущей формы
    const error = data.errors.payment || data.errors.address || "";
    orderForm.errors = error;
  }
});

// Обработчик отправки формы заказа
events.on("order:submit", () => {
  // Обновляем данные формы контактов из модели
  contactsForm.email = customer.email;
  contactsForm.phone = customer.phone;
  // Проверяем валидность на основе данных в модели
  const isValid = !!(customer.email && customer.phone);
  
  contactsForm.valid = isValid;
  contactsForm.errors = isValid ? "" : "Заполните все поля";
  modal.render({ content: contactsForm.render() });
  modal.open();
});

// Обработчик валидации формы контактов
events.on("contacts:validate", (data: { isValid: boolean }) => {
  if (contactsForm) {
    contactsForm.valid = data.isValid;
  }
});

// ============ ФОРМА КОНТАКТОВ ============

// Обработчик изменения email
events.on("contacts.email:change", (data: { email: string }) => {
  customer.customerData = { email: data.email };
  const isContactsValid = !!(customer.email && customer.phone);
  //  Используем validateContacts() - проверяем ТОЛЬКО email и phone!
  const validation = customer.validate();
  events.emit("contacts:validate", {
    isValid: isContactsValid,
    errors: validation.errors,
  });
});

events.on("contacts.phone:change", (data: { phone: string }) => {
  customer.customerData = { phone: data.phone };
  const isContactsValid = !!(customer.email && customer.phone);
  //  Используем validateContacts() - проверяем ТОЛЬКО email и phone!
  const validation = customer.validate();
  events.emit("contacts:validate", {
    isValid: isContactsValid,
    errors: validation.errors,
  });
});

events.on("contacts:validate", (data: { isValid: boolean; errors: any }) => {
  if (contactsForm) {
    contactsForm.valid = data.isValid;

    // Показываем ошибку для текущей формы
    const error = data.errors.email || data.errors.phone || "";
    contactsForm.errors = error;
  }
});

// Обработчик отправки формы контактов (ФИНАЛЬНЫЙ ШАГ)
events.on("contacts:submit", async () => {
  try {
    const availableItems = cart.itemsInCart.filter(
      (item) => item.price !== null,
    );

    if (availableItems.length === 0) {
      throw new Error("В корзине нет доступных для покупки товаров");
    }

    const total = availableItems.reduce((sum, item) => sum + item.price!, 0);
    const itemIds = availableItems.map((item) => item.id);

    const orderData: IOrderRequest = {
      payment: customer.payment,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      total: total,
      items: itemIds,
    };

    // Отправляем заказ
    const orderResponse = await apiService.postOrder(orderData);
    //  СНАЧАЛА показываем Success
    success.total = orderResponse.total;

    modal.render({ content: success.render() });
    modal.open();

    //  ПОТОМ очищаем данные (после того как Success уже показан)
    //  Очищаем данные через методы, а не прямой установкой
    cart.clearCart(); // модель эмитит basket:changed
    customer.clearCustomerData();
  } catch (error) {
    // Просто выводим ошибку в консоль
    console.error("Ошибка оформления заказа:", error);
  }
});

events.on("success:close", () => {
  modal.close();
});
