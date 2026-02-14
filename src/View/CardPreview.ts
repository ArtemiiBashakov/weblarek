import { Card } from "./Card";
import { ICardActions } from "./Card";
import { ensureElement } from "../utils/utils";
import { categoryMap } from "../utils/constants";

export type PreviewCardData = {
  id: string;
  title: string;
  image: string;
  category: string;
  price: number | null;
  description: string;
};

export class CardPreview extends Card<PreviewCardData> {
  protected _image: HTMLImageElement;
  protected _category: HTMLElement;
  protected _description: HTMLElement;
  protected _button: HTMLButtonElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container, actions);

    this._image = ensureElement<HTMLImageElement>(".card__image", container);
    this._category = ensureElement<HTMLElement>(".card__category", container);
    this._description = ensureElement<HTMLElement>(".card__text", container);
    this._button = ensureElement<HTMLButtonElement>(".card__button", container);

    if (actions?.onClick) {
      this._button.addEventListener("click", actions.onClick);
    }
  }

  set image(value: string) {
    this.setImage(this._image, value, this.title);
  }

  set category(value: string) {
    this.setText(this._category, value);

    Object.keys(categoryMap).forEach((key) => {
      this._category.classList.toggle(
        categoryMap[key as keyof typeof categoryMap],
        key === value,
      );
    });
  }

  set description(value: string) {
    this.setText(this._description, value);
  }

  set buttonText(value: string) {
    this._button.textContent = value;
  }

  set buttonDisabled(value: boolean) {
    this._button.disabled = value;
  }
}
