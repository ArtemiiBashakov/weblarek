import { Component } from "../components/base/Component";
import { IEvents } from "../components/base/Events";
import { ensureElement } from "../utils/utils";

export interface IBasket {
  items: HTMLElement[];
  total: number;
}

export class Basket extends Component<IBasket> {
  protected _list: HTMLElement;
  protected _total: HTMLElement;
  protected _button: HTMLButtonElement;

  constructor(
    container: HTMLElement,
    protected events: IEvents,
  ) {
    super(container);

    this._list = ensureElement<HTMLElement>(".basket__list", container);
    this._total = ensureElement<HTMLElement>(".basket__price", container);
    this._button = ensureElement<HTMLButtonElement>(
      ".basket__button",
      container,
    );

    this._button.addEventListener("click", () => {
      events.emit("basket:order");
    });
  }

  set items(items: HTMLElement[]) {
    this._list.innerHTML = "";
    items.forEach((item) => {
      this._list.appendChild(item);
    });
  }

  set total(value: number) {
    this.setText(this._total, `${value} синапсов`);
  }

  protected setText(element: HTMLElement, value: string) {
    if (element) {
      element.textContent = value;
    }
  }
}
