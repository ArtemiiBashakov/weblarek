import { Component } from "../components/base/Component";
import { IEvents } from "../components/base/Events";
import { ensureElement } from "../utils/utils";

interface IModal {
  content: HTMLElement;
}

export class Modal extends Component<IModal> {
  protected _closeButton: HTMLButtonElement;
  protected _content: HTMLElement;

  constructor(
    container: HTMLElement,
    protected events: IEvents,
  ) {
    super(container);

    this._closeButton = ensureElement<HTMLButtonElement>(
      ".modal__close",
      container,
    );
    this._content = ensureElement<HTMLElement>(".modal__content", container);

    this._closeButton.addEventListener("click", this.close.bind(this));
    this.container.addEventListener("click", this.close.bind(this));
    this._content.addEventListener("click", (event) => event.stopPropagation());
  }

  set content(value: HTMLElement) {
    this._content.replaceChildren(value);
  }

  open() {
    this.container.classList.add("modal_active");
    this.events.emit("modal:open");
  }

  close() {
    this.container.classList.remove("modal_active");
    // this._content.innerHTML = "";
    this._content.replaceChildren(); // ← очищаем содержимое
    this.events.emit("modal:close");
  }

  get isOpen(): boolean {
    return this.container.classList.contains("modal_active");
  }
}
