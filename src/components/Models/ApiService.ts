import {
  IApi,
  IProductsResponse,
  IOrderRequest,
  IOrderResponse,
  // IOrderInput,
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
  async postOrder(orderData: IOrderRequest): Promise<IOrderResponse> {
    try {
      // const orderData = this.prepareOrderData(orderInput);
      return await this.api.post<IOrderResponse>("/order/", orderData);
    } catch (error) {
      console.error("Ошибка при отправке заказа:", error);
      throw error;
    }
  }
}
