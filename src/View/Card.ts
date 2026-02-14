import { Component } from "../components/base/Component";
import { ensureElement } from "../utils/utils";

export interface ICardActions {
  onClick?: () => void;
}

export abstract class Card<T> extends Component<T> {
  protected _title: HTMLElement;
  protected _price: HTMLElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container);

    this._title = ensureElement<HTMLElement>(".card__title", container);
    this._price = ensureElement<HTMLElement>(".card__price", container);

    if (actions?.onClick) {
      container.addEventListener("click", actions.onClick);
    }
  }

  set title(value: string) {
    this.setText(this._title, value);
  }

  set price(value: number | null) {
    if (value === null) {
      this.setText(this._price, "Бесценно");
    } else {
      this.setText(this._price, `${value} синапсов`);
    }
  }

  protected setText(element: HTMLElement, value: string) {
    if (element) {
      element.textContent = value;
    }
  }
}
