import { Card } from "./Card";
import { ICardActions } from "./Card";
import { ensureElement } from "../utils/utils";

export type BasketCardData = {
  index: number;
  title: string;
  price: number;
};

export class CardBasket extends Card<BasketCardData> {
  protected _index: HTMLElement;
  protected _deleteButton: HTMLButtonElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container);

    this._index = ensureElement<HTMLElement>(".basket__item-index", container);
    this._deleteButton = ensureElement<HTMLButtonElement>(
      ".basket__item-delete",
      container,
    );

    if (actions?.onClick) {
      this._deleteButton.addEventListener("click", (event) => {
        actions.onClick?.(event);
      });
    }
  }

  set index(value: number) {
    this.setText(this._index, String(value));
  }
  set id(value: string) {
    this.container.dataset.id = value;
  }
}
