import { Card } from "./Card";
import { ICardActions } from "./Card";

export type CatalogCardData = {
  id: string;
  title: string;
  image: string;
  category: string;
  price: number | null;
};

export class CardCatalog extends Card<CatalogCardData> {
  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container, actions);
  }

  // Специфичные методы для карточки каталога
  set id(value: string) {
    this.container.dataset.id = value;
  }

  get id(): string {
    return this.container.dataset.id || "";
  }
}
