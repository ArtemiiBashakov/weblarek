import { Form } from "./Form";
import { IEvents } from "../components/base/Events";
import { ensureElement } from "../utils/utils";
// import { TPayment } from '../types';
import { IOrderForm } from "../types";

export class OrderForm extends Form<IOrderForm> {
  protected _paymentButtons: HTMLButtonElement[];
  protected _addressInput: HTMLInputElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);

    this._paymentButtons = Array.from(
      this.container.querySelectorAll(".button_alt"),
    ) as HTMLButtonElement[];

    this._addressInput = ensureElement<HTMLInputElement>(
      'input[name="address"]',
      container,
    );

    // При клике на способ оплаты - генерируем событие
    this._paymentButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // Снимаем активный класс со всех кнопок
        this._paymentButtons.forEach((btn) =>
          btn.classList.remove("button_alt-active"),
        );
        // Добавляем активный класс нажатой кнопке
        button.classList.add("button_alt-active");

        // Сообщаем, что способ оплаты изменился
        this.events.emit("order.payment:change", {
          payment: button.name,
        });
      });
    });

    // При вводе адреса - генерируем событие
    this._addressInput.addEventListener("input", () => {
      this.events.emit("order.address:change", {
        address: this._addressInput.value,
      });
    });
  }

  // Только СЕТТЕРЫ для обновления отображения из Model
  set payment(value: string) {
    // Преобразуем значение из модели в имя кнопки
    let buttonName = "";
    if (value === "online") buttonName = "card";
    else if (value === "При получении") buttonName = "cash";
    else buttonName = value;

    this._paymentButtons.forEach((button) => {
      const shouldBeActive = button.name === buttonName;
      button.classList.toggle("button_alt-active", shouldBeActive);
    });
  }

  set address(value: string) {
    this._addressInput.value = value;
  }

  // НИКАКИХ ГЕТТЕРОВ! Данные только через события.
}
