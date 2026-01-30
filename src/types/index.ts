export type ApiPostMethods = "POST" | "PUT" | "DELETE";

export interface IApi {
  get<T extends object>(uri: string): Promise<T>;
  post<T extends object>(
    uri: string,
    data: object,
    method?: ApiPostMethods,
  ): Promise<T>;
}

/**Сюда пишем основные рабочие интерфейсы Покупатель и Товар */
export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}

export interface ICustomer {
  payment: TPayment;
  email: string;
  phone: string;
  address: string;
}

export type TPayment = "online" | "";

// Ответ сервера с товарами
export interface IProductsResponse {
  total: number;
  items: IProduct[];
}

// Интерфейс для данных, которые передаются в postOrder
export interface IOrderInput {
  customer: ICustomer; // Данные покупателя
  cart: IProduct[]; // Товары в корзине
}

// Данные для отправки заказа
export interface IOrderRequest {
  payment: TPayment;
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[]; // массив ID товаров
}

// Ответ сервера на заказ
export interface IOrderResponse {
  id: string;
  total: number;
}

export interface IValidationResult {
  isValid: boolean;
  errors: Record<keyof ICustomer, string>;
} //Интерфейс для результатов валидации