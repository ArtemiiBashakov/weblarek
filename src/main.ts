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

// Подписка на события
events.on("catalog:changed", () => {
  const items = catalog.catalogProducts.map((item) => {
    const card = new CardCatalog(cloneTemplate(cardCatalogTemplate), {
      onClick: () => events.emit("card:select", item),
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

events.on("basket:changed", () => {
  header.counter = cart.productsCount();
});

events.on("catalog:selected", (data: { product: IProduct }) => {
  // Можно использовать, например, для аналитики или дополнительных действий
  console.log("Выбран товар:", data.product.title);
  // Сейчас это событие уже используется в card:select,
  // но обработчик можно добавить для расширения функциональности
});

events.on("customer:changed", () => {
  // Обновляем валидацию текущей открытой формы
  if (currentOrderForm) {
    const validation = customer.validate(["payment", "address"]);
    currentOrderForm.valid = validation.isValid;
    currentOrderForm.errors =
      validation.errors.payment || validation.errors.address || "";
  }

  if (currentContactsForm) {
    const validation = customer.validate(["email", "phone"]);
    currentContactsForm.valid = validation.isValid;
    currentContactsForm.errors =
      validation.errors.email || validation.errors.phone || "";
  }
});

events.on("basket:open", () => {
  // Создаем корзину
  const basket = new Basket(cloneTemplate(basketTemplate), events);

  // Создаем карточки товаров для корзины
  const basketItems = cart.itemsInCart.map((item, index) => {
    const card = new CardBasket(cloneTemplate(cardBasketTemplate), {
      onClick: () => {
        events.emit("basket:remove", item);
      },
    });
    card.id = item.id;
    return card.render({
      title: item.title,
      price: item.price || 0,
      index: index + 1,
    });
  });

  // Устанавливаем товары и общую сумму
  basket.render({
    items: basketItems,
    total: cart.totalPrice(),
  });

  // Показываем модалку
  modal.render({ content: basket.element });
  modal.open();
});

// Обработчик выбора карточки товара (детальный просмотр)
events.on("card:select", (item: IProduct) => {
  // Создаем карточку предпросмотра
  const preview = new CardPreview(cloneTemplate(cardPreviewTemplate), {
    onClick: () => events.emit("card:add", item),
  });

  // Настраиваем кнопку (если товар уже в корзине)
  const isInCart = cart.hasItem(item.id);
  preview.buttonText = isInCart ? "Уже в корзине" : "В корзину";
  preview.buttonDisabled = isInCart || item.price === null;

  // Рендерим данные
  preview.render({
    ...item,
    image: `${CDN_URL}${item.image}`,
    price: item.price,
  });

  // Показываем модалку
  modal.render({ content: preview.element });
  modal.open();
});

// Обработчик добавления в корзину
events.on("card:add", (item: IProduct) => {
  if (item.price !== null) {
    cart.putItemInCart(item);
    modal.close(); // Закрываем модалку после добавления
  }
});

// Обработчик удаления из корзины
// Слушаем СОБЫТИЕ ОТ VIEW (клик по кнопке удаления)
events.on("basket:remove", (item: IProduct) => {
  cart.deleteItemFromCart(item); // ← модель сама эмитнет basket:removed
});

// Слушаем СОБЫТИЕ ОТ МОДЕЛИ (товар реально удален)
events.on("basket:removed", () => {
  events.emit("basket:open"); // переоткрываем корзину
});

// Загрузка данных
apiService
  .getProducts()
  .then((products) => {
    catalog.catalogProducts = products;
    events.emit("catalog:changed");
  })
  .catch(console.error);

// Храним ссылки на активные формы
let currentOrderForm: OrderForm | null = null;
let currentContactsForm: ContactsForm | null = null;

events.on("basket:order", () => {
  // Создаем форму заказа и СОХРАНЯЕМ ссылку
  currentOrderForm = new OrderForm(cloneTemplate(orderTemplate), events);

  // Устанавливаем текущие значения из модели
  if (customer.payment) {
    currentOrderForm.payment = customer.payment;
  }
  if (customer.address) {
    currentOrderForm.address = customer.address;
  }

  // Проверяем валидность данных
  currentOrderForm.valid = false; // Явно выключаем кнопку
  currentOrderForm.errors = ""; // Очищаем ошибки

  // Показываем модалку
  modal.render({ content: currentOrderForm.element });
  modal.open();
});

// ============ ФОРМА ЗАКАЗА (адрес/оплата) ============

// Обработчик изменения способа оплаты
events.on("order.payment:change", (data: { payment: string }) => {
  // Преобразуем card → online, cash → При получении
  let paymentValue: TPayment;
  if (data.payment === "card") paymentValue = "online";
  else if (data.payment === "cash") paymentValue = "При получении";
  else paymentValue = data.payment as TPayment;

  customer.customerData = { payment: paymentValue };

  //  Используем validateOrder() - проверяем ТОЛЬКО payment и address!
  const validation = customer.validate(["payment", "address"]);
  events.emit("order:validate", {
    isValid: validation.isValid,
    errors: validation.errors,
  });
});

events.on("order.address:change", (data: { address: string }) => {
  customer.customerData = { address: data.address };

  //  Используем validateOrder() - проверяем ТОЛЬКО payment и address!
  const validation = customer.validate(["payment", "address"]);
  events.emit("order:validate", {
    isValid: validation.isValid,
    errors: validation.errors,
  });
});

events.on("order:validate", (data: { isValid: boolean; errors: any }) => {
  if (currentOrderForm) {
    currentOrderForm.valid = data.isValid;

    // Показываем ошибку для текущей формы
    const error = data.errors.payment || data.errors.address || "";
    currentOrderForm.errors = error;
  }
});

// Обработчик отправки формы заказа
events.on("order:submit", () => {
  if (!currentOrderForm) return;

  // Переход к форме контактов
  currentContactsForm = new ContactsForm(
    cloneTemplate(contactsTemplate),
    events,
  );

  // Устанавливаем текущие значения из модели
  if (customer.email) {
    currentContactsForm.email = customer.email;
  }
  if (customer.phone) {
    currentContactsForm.phone = customer.phone;
  }

  // Проверяем валидность данных
  const isValid = !!(customer.email && customer.phone);
  currentContactsForm.valid = isValid;

  modal.render({ content: currentContactsForm.element });
  modal.open();
});

// Обработчик валидации формы контактов
events.on("contacts:validate", (data: { isValid: boolean }) => {
  if (currentContactsForm) {
    currentContactsForm.valid = data.isValid;
  }
});

// ============ ФОРМА КОНТАКТОВ ============

// Обработчик изменения email
events.on("contacts.email:change", (data: { email: string }) => {
  customer.customerData = { email: data.email };

  //  Используем validateContacts() - проверяем ТОЛЬКО email и phone!
  const validation = customer.validate(["email", "phone"]);
  events.emit("contacts:validate", {
    isValid: validation.isValid,
    errors: validation.errors,
  });
});

events.on("contacts.phone:change", (data: { phone: string }) => {
  customer.customerData = { phone: data.phone };

  //  Используем validateContacts() - проверяем ТОЛЬКО email и phone!
  const validation = customer.validate(["email", "phone"]);
  events.emit("contacts:validate", {
    isValid: validation.isValid,
    errors: validation.errors,
  });
});

events.on("contacts:validate", (data: { isValid: boolean; errors: any }) => {
  if (currentContactsForm) {
    currentContactsForm.valid = data.isValid;

    // Показываем ошибку для текущей формы
    const error = data.errors.email || data.errors.phone || "";
    currentContactsForm.errors = error;
  }
});

// Обработчик отправки формы контактов (ФИНАЛЬНЫЙ ШАГ)
events.on("contacts:submit", async () => {
  const validation = customer.validate();
  if (!validation.isValid) {
    // Показываем первую ошибку
    const firstError = Object.values(validation.errors).find(
      (err) => err !== "",
    );
    if (currentContactsForm) {
      currentContactsForm.errors = firstError || "Заполните все поля";
    }
    return; // НЕ отправляем заказ!
  }
  try {
    // Отправляем заказ
    const orderResponse = await apiService.postOrder({
      customer: {
        payment: customer.payment,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      },
      cart: cart.itemsInCart,
    });

    const success = new Success(cloneTemplate(successTemplate), events);
    success.total = orderResponse.total;

    modal.render({ content: success.element });
    modal.open();

    // Очищаем корзину и данные покупателя
    cart.clearCart();
    customer.customerData = {
      payment: "",
      email: "",
      phone: "",
      address: "",
    };

    events.emit("basket:changed");
  } catch (error) {
    console.error("Ошибка оформления заказа:", error);
    // Показываем ошибку в форме
    const contacts = document.querySelector('.form[name="contacts"]');
    if (contacts) {
      const contactsForm = new ContactsForm(contacts as HTMLElement, events);
      contactsForm.errors = "Не удалось оформить заказ. Попробуйте позже.";
    }
  }
});

events.on("success:close", () => {
  modal.close();
});
