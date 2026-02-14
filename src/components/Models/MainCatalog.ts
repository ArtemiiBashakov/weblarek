import { IProduct } from "../../types";
import { IEvents } from "../base/Events";
export class MainCatalogModel {
  private _catalogProducts: IProduct[] = [];
  private _selectedProduct: IProduct | null = null;
  //Конструктор инжектит брокер
  constructor(private events: IEvents) {}

  // Сеттер для помещения всех товаров из переданных данных в массив товаров
  set catalogProducts(products: IProduct[]) {
    this._catalogProducts = [...products];
    this.events.emit("catalog:changed", { catalog: this._catalogProducts }); // ← СОБЫТИЕ
  }
  //Геттер возвращающий весь массив товаров
  get catalogProducts(): IProduct[] {
    return this._catalogProducts;
  }
  //Находит и сохраняет выбранный продукт по id
  set selectedProduct(product: IProduct) {
    // Даже если товар без цены, мы все равно его сохраняем и открываем модалку
    this._selectedProduct = product;

    // Но добавляем предупреждение в консоль
    if (product.price === null) {
      console.warn(
        `Товар "${product.title}" не продается, но его можно посмотреть`,
      );
    }

    // Всегда эмитим событие для открытия модалки
    this.events.emit("catalog:selected", { product: this._selectedProduct });
  }
  //Возвращает выбранный продукт
  get selectedProduct(): IProduct | null {
    return this._selectedProduct;
  }
  //Функция поиска товара в массиве этого класса по id
  getProductById(id: string): IProduct | null {
    return this._catalogProducts.find((product) => product.id === id) || null;
  }
}
