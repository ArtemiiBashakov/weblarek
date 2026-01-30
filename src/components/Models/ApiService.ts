import {
  IApi,
  IProductsResponse,
  IOrderRequest,
  IOrderResponse,
  IOrderInput,
  IProduct,
} from "../../types";

export class ApiService {
  constructor(private api: IApi) {}

  // Получение каталога товаров
  async getProducts(): Promise<IProduct[]> {
    try {
      // Используем API_URL из constants.ts
      const response: IProductsResponse =
        await this.api.get<IProductsResponse>("/product/");
      return response.items;
    } catch (error) {
      console.error("Ошибка при получении товаров:", error);
      throw error;
    }
  }

  // Отправка заказа
  async postOrder(orderInput: IOrderInput): Promise<IOrderResponse> {
    try {
      const orderData = this.prepareOrderData(orderInput);
      return await this.api.post<IOrderResponse>("/order/", orderData);
    } catch (error) {
      console.error("Ошибка при отправке заказа:", error);
      throw error;
    }
  }

  private prepareOrderData(orderInput: IOrderInput): IOrderRequest {
    const { customer, cart } = orderInput;
    // Фильтруем товары с ценой
    const availableItems = cart.filter((item) => item.price !== null);
    // Проверяем, есть ли товары для заказа
    if (availableItems.length === 0) {
      throw new Error("В корзине нет доступных для покупки товаров");
    }
    //Цена всего заказа
    const total = availableItems.reduce((sum, item) => sum + item.price!, 0);
    // Получаем ID товаров
    const itemIds = availableItems.map((item) => item.id);
    // Проверяем валидность данных покупателя
    if (
      !customer.payment ||
      !customer.email ||
      !customer.phone ||
      !customer.address
    ) {
      throw new Error("Не все данные покупателя заполнены");
    }

    return {
      payment: customer.payment,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      total: total,
      items: itemIds, //Получается обьект типа IOrderResponce
    };
  }
}
