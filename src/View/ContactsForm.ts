import { Form } from "./Form";
import { IEvents } from "../components/base/Events";
import { ensureElement } from "../utils/utils";
import { IContactsForm } from "../types";

export class ContactsForm extends Form<IContactsForm> {
  protected _emailInput: HTMLInputElement;
  protected _phoneInput: HTMLInputElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);

    this._emailInput = ensureElement<HTMLInputElement>(
      'input[name="email"]',
      container,
    );
    this._phoneInput = ensureElement<HTMLInputElement>(
      'input[name="phone"]',
      container,
    );

    // При вводе email - генерируем событие
    this._emailInput.addEventListener("input", () => {
      this.events.emit("contacts.email:change", {
        email: this._emailInput.value,
      });
    });

    // При вводе телефона - генерируем событие
    this._phoneInput.addEventListener("input", () => {
      this.events.emit("contacts.phone:change", {
        phone: this._phoneInput.value,
      });
    });
  }

  // Только СЕТТЕРЫ
  set email(value: string) {
    this._emailInput.value = value;
  }

  set phone(value: string) {
    this._phoneInput.value = value;
  }
}
