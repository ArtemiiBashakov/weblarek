import { Component } from "../components/base/Component";
import { IEvents } from "../components/base/Events";
import { ensureElement } from "../utils/utils";

export interface ISuccess {
  total: number;
}

export class Success extends Component<ISuccess> {
  protected _total: HTMLElement;
  protected _closeButton: HTMLButtonElement;

  constructor(
    container: HTMLElement,
    protected events: IEvents,
  ) {
    super(container);

    this._total = ensureElement<HTMLElement>(
      ".order-success__description",
      container,
    );
    this._closeButton = ensureElement<HTMLButtonElement>(
      ".order-success__close",
      container,
    );

    this._closeButton.addEventListener("click", () => {
      events.emit("success:close");
    });
  }

  set total(value: number) {
    this.setText(this._total, `Списано ${value} синапсов`);
  }

  protected setText(element: HTMLElement, value: string) {
    if (element) {
      element.textContent = value;
    }
  }
}
