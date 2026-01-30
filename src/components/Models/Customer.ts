import { ICustomer, TPayment } from "../../types";
interface IValidationResult {
  isValid: boolean;
  errors: Record<keyof ICustomer, string>;
} //Интерфейс для результатов валидации

export class CustomerModel {
  private _customerData: ICustomer = {
    payment: "",
    email: "",
    phone: "",
    address: "",
  };

  // Сохранение всех данных сразу одним методов, или одного/нескольких за раз, без удаления не переданных в параметры
  set customerData(data: Partial<ICustomer>) {
    this._customerData = { ...this._customerData, ...data };
  }
  // Геттер для получения всех данных пользователя. Возвращаем копию
  get customerData(): ICustomer {
    return { ...this._customerData };
  }

  // Геттеры для отдельных полей
  get payment(): TPayment {
    return this._customerData.payment;
  }

  get email(): string {
    return this._customerData.email;
  }

  get phone(): string {
    return this._customerData.phone;
  }

  get address(): string {
    return this._customerData.address;
  }

  //Очистка всех полей данных пользователя
  clearСustomerData(): void {
    this._customerData = {
      payment: "",
      email: "",
      phone: "",
      address: "",
    };
  }

  //Валидация данных одним методом
  validate(): IValidationResult {
    const errors: Record<keyof ICustomer, string> = {
      payment: "",
      email: "",
      phone: "",
      address: "",
    };

    let isValid = true;

    // Валидация оплаты
    if (!this._customerData.payment) {
      errors.payment = "Выберите способ оплаты";
      isValid = false;
    } else if (this._customerData.payment !== "online") {
      errors.payment = "Неверный способ оплаты";
      isValid = false;
    }

    // Валидация email
    if (!this._customerData.email.trim()) {
      errors.email = "Введите email";
      isValid = false;
    } else if (!this.isValidEmail(this._customerData.email)) {
      errors.email = "Введите корректный email";
      isValid = false;
    }

    // Валидация телефона
    if (!this._customerData.phone.trim()) {
      errors.phone = "Введите телефон";
      isValid = false;
    } else if (!this.isValidPhone(this._customerData.phone)) {
      errors.phone = "Введите корректный телефон";
      isValid = false;
    }

    // Валидация адреса
    if (!this._customerData.address.trim()) {
      errors.address = "Введите адрес";
      isValid = false;
    }

    return { isValid, errors };
  }

  // Проверка валидности email - вспомогательный метод
  private isValidEmail(email: string): boolean {
    // console.log('Проверяемый email:', `"${email}"`);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Проверка валидности телефона - вспомогательный метод
  private isValidPhone(tel: string): boolean {
    // console.log('Проверяемый tel:', `"${tel}"`);
    const phoneRegex =
      /^(\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/;
    return phoneRegex.test(tel);
  }

  // Проверка, все ли поля заполнены - вспомогательный метод
  get isComplete(): boolean {
    const validation = this.validate();
    return validation.isValid;
  }

  // Получение только ошибок валидации - вспомогательный метод
  get validationErrors(): Record<keyof ICustomer, string> {
    return this.validate().errors;
  }
}
