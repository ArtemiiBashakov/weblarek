import { Component } from "../components/base/Component";

export interface IGallery {
  catalog: HTMLElement[];
}

export class Gallery extends Component<IGallery> {
  protected _catalog: HTMLElement;

  constructor(container: HTMLElement) {
    super(container);
    this._catalog = container;
  }

  set catalog(items: HTMLElement[]) {
    this._catalog.innerHTML = "";
    items.forEach((item) => {
      this._catalog.appendChild(item);
    });
  }
}
