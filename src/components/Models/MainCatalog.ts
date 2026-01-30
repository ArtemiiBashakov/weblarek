import { IProduct } from "../../types";

export class MainCatalogModel {
  private _catalogProducts: IProduct[] = [];
  private _selectedProduct: IProduct | null = null;
  //Конструктор кладет все товары в поле массива из внешнего источника при инициализации
  constructor(initialProducts: IProduct[]) {
    this.catalogProducts = initialProducts;
  }
  // Сеттер для помещения всех товаров из переданных данных в массив товаров
  set catalogProducts(products: IProduct[]) {
    this._catalogProducts = [...products];
  }
  //Геттер возвращающий весь массив товаров
  get catalogProducts(): IProduct[] {
    return this._catalogProducts;
  }
  //Находит и сохраняет выбранный продукт по id
  set selectedProduct(productId: string) {
    const product = this.getProductById(productId);
    if (product) {
      this._selectedProduct = product;
    } else {
      throw new Error(`Продукт с id ${productId} не найден`);
    }
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
