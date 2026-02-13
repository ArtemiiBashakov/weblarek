import { Card } from "./Card";
import { ICardActions } from "./Card";
import { ensureElement } from "../utils/utils";

export type PreviewCardData = {
  id: string;
  title: string;
  image: string;
  category: string;
  price: number | null;
  description: string;
};

export class CardPreview extends Card<PreviewCardData> {
  protected _button: HTMLButtonElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container);

    this._button = ensureElement<HTMLButtonElement>(".card__button", container);

    if (actions?.onClick) {
      this._button.addEventListener("click", (event) => {
        actions.onClick?.(event); // ← ДОЛЖЕН БЫТЬ event
      });
    }
  }

  set buttonText(value: string) {
    this._button.textContent = value;
  }

  set buttonDisabled(value: boolean) {
    this._button.disabled = value;
  }
}
