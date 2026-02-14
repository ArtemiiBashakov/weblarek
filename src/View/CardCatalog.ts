import { Card } from "./Card";
import { ICardActions } from "./Card";
import { ensureElement } from "../utils/utils";
import { categoryMap } from "../utils/constants";

export type CatalogCardData = {
  id: string;
  title: string;
  image: string;
  category: string;
  price: number | null;
};

export class CardCatalog extends Card<CatalogCardData> {
  protected _image: HTMLImageElement;
  protected _category: HTMLElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container, actions);

    this._image = ensureElement<HTMLImageElement>(".card__image", container);
    this._category = ensureElement<HTMLElement>(".card__category", container);
  }

  set image(value: string) {
    this.setImage(this._image, value, this.title);
  }

  set category(value: string) {
    this.setText(this._category, value);

    // Устанавливаем класс категории
    Object.keys(categoryMap).forEach((key) => {
      this._category.classList.toggle(
        categoryMap[key as keyof typeof categoryMap],
        key === value,
      );
    });
  }

  set id(value: string) {
    this.container.dataset.id = value;
  }
}
