import { IProduct } from "../../types";

export class MainCatalogModel {
  private _catalogProducts: IProduct[] = [];
  private _selectedProduct: IProduct | null = null;
  //Конструктор кладет все товары в поле массива из внешнего источника при инициализации
  
  // Сеттер для помещения всех товаров из переданных данных в массив товаров
  set catalogProducts(products: IProduct[]) {
    this._catalogProducts = [...products];
  }
  //Геттер возвращающий весь массив товаров
  get catalogProducts(): IProduct[] {
    return this._catalogProducts;
  }
  //Находит и сохраняет выбранный продукт по id
  set selectedProduct(product: IProduct) {
    if (product.price === null) {
        console.error(`Товар "${product.title}" не продается`);
        return; // прерываем обработку ЭТОГО товара
      } else {
        this._selectedProduct = product;
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
