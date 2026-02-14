import { IProduct } from "../../types";
import { IEvents } from "../base/Events";
export class CartModel {
  private _itemsInCart: IProduct[] = [];

  constructor(private events: IEvents) {} // ← инжектим брокер

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
      this.events.emit("basket:changed", { cart: this._itemsInCart }); // ← СОБЫТИЕ
    }
  }

  //Удалить товар из корзины
  deleteItemFromCart(selectedProduct: IProduct): void {
    this._itemsInCart = this._itemsInCart.filter(
      (item) => item.id !== selectedProduct.id,
    );
    this.events.emit("basket:changed", { cart: this._itemsInCart }); // ← СОБЫТИЕ
    console.trace();
  }

  //Очистить корзину
  clearCart(): void {
    this._itemsInCart = [];
    this.events.emit("basket:changed", { cart: this._itemsInCart }); // ← ДОБАВИТЬ!
    this.events.emit("basket:cleared"); // ← ТОЛЬКО ЗДЕСЬ!
  }
  //Общее число товаров в корзине
  productsCount(): number {
    return this._itemsInCart.length; // Сначала считаем
  }
  // Общая сумма товаров в корзине
  totalPrice(): number {
    return this._itemsInCart.reduce(
      (total, product) => total + (product.price ?? 0),
      0,
    );
  }

  // Проверка наличия продукта в корзине по id позвращает булевое значение
  hasItem(productId: string): boolean {
    const exists = this._itemsInCart.some((item) => item.id === productId);
    return exists;
  }
}
