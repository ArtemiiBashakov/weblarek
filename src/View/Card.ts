import { Component } from "../components/base/Component";
import { ensureElement } from "../utils/utils";
import { categoryMap } from "../utils/constants";

export interface ICard {
  title: string;
  description?: string;
  image?: string;
  category?: string;
  price: number | null;
}

export interface ICardActions {
  onClick?: (event: MouseEvent) => void;
}

export abstract class Card<T> extends Component<T> {
  protected _title: HTMLElement;
  protected _price: HTMLElement;
  protected _image?: HTMLImageElement;
  protected _category?: HTMLElement;
  protected _description?: HTMLElement;
  protected _button?: HTMLButtonElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container);

    this._title = ensureElement<HTMLElement>(".card__title", container);
    this._price = ensureElement<HTMLElement>(".card__price", container);

    // Опциональные элементы
    this._image = container.querySelector(".card__image") || undefined;
    this._category = container.querySelector(".card__category") || undefined;
    this._description = container.querySelector(".card__text") || undefined;
    this._button = container.querySelector(".card__button") || undefined;

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
      this._button?.setAttribute("disabled", "true");
    } else {
      this.setText(this._price, `${value} синапсов`);
    }
  }

  set image(value: string) {
    if (this._image) {
      // Проверяем, что элемент существует
      this.setImage(this._image, value, this._title?.textContent || "");
    }
  }

  set category(value: string) {
    if (!this._category) return;

    this.setText(this._category, value);

    // Устанавливаем класс категории
    Object.keys(categoryMap).forEach((key) => {
      this._category?.classList.toggle(
        categoryMap[key as keyof typeof categoryMap],
        key === value,
      );
    });
  }

  set description(value: string) {
    if (this._description) {
      this.setText(this._description, value);
    }
  }

  protected setText(element: HTMLElement, value: string) {
    if (element) {
      element.textContent = value;
    }
  }
}
