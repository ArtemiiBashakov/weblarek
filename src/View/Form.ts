import { Component } from "../components/base/Component";
import { IEvents } from "../components/base/Events";
import { ensureElement } from "../utils/utils";
// import { IForm } from '../types';

export abstract class Form<T> extends Component<T> {
  protected _submit: HTMLButtonElement;
  protected _errors: HTMLElement;
  protected _form: HTMLFormElement;

  constructor(
    container: HTMLElement,
    protected events: IEvents,
  ) {
    super(container);

    this._form = container as HTMLFormElement;
    this._submit = ensureElement<HTMLButtonElement>(
      '[type="submit"]',
      container,
    );
    this._errors = ensureElement<HTMLElement>(".form__errors", container);

    // При сабмите просто генерируем событие - данные достанет Presenter из Model!
    this._form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.events.emit(`${this._form.name}:submit`);
    });
  }

  set valid(value: boolean) {
    this._submit.disabled = !value;
  }

  set errors(value: string) {
    // Принимаем строку, а не массив
    this.setText(this._errors, value);
  }

  protected setText(element: HTMLElement, value: string) {
    if (element) element.textContent = value;
  }
}
