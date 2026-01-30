import { IProduct } from "../../types";

export class CartModel {
  private _itemsInCart: IProduct[] = [];

  //Получение всего массива корзины покупателя - геттер
  get itemsInCart(): IProduct[] {
    return [...this._itemsInCart];
  }
  //Положить один товар в корзину
  putItemInCart(product: IProduct): void {
    
      if (product.price === null) {
        console.error(`Товар "${product.title}" не продается`);
        return; // прерываем обработку ЭТОГО товара
      }
      if (!this.hasItem(product.id)) {
        this._itemsInCart.push(product);
      }
    };
  
  //Удалить товар из корзины
  deleteItemFromCart(selectedProduct: IProduct): IProduct[] {
    this._itemsInCart = this._itemsInCart.filter(
      (item) => item.id !== selectedProduct.id,
    );
    return this.itemsInCart; // геттер
  }

  //Очистить корзину
  clearCart(): void {
    this._itemsInCart = [];
  }
  //Общее число товаров в корзине
  productsCount(): number {
    return this.itemsInCart.length;
  }
  // Общая сумма товаров в корзине
  totalPrice(): number {
    return this._itemsInCart.reduce(
      (total, product) => total + (product.price ?? 0),
      0,
    );
  }
  //Поиск товара в корзине по id
  getItemById(productId: string): IProduct | null {
    return this._itemsInCart.find((item) => item.id === productId) || null;
  }
  // Проверка наличия продукта в корзине по id позвращает булевое значение
  hasItem(productId: string): boolean {
    return this._itemsInCart.some((item) => item.id === productId);
  }
}
