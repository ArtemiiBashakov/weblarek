import { ICustomer, TPayment, IValidationResult } from "../../types";
import { IEvents } from "../base/Events";

export class CustomerModel {
  private _customerData: ICustomer = {
    payment: "",
    email: "",
    phone: "",
    address: "",
  };

  constructor(private events: IEvents) {} // ← инжектим брокер

  // Сохранение всех данных сразу одним методов, или одного/нескольких за раз, без удаления не переданных в параметры
  set customerData(data: Partial<ICustomer>) {
    this._customerData = { ...this._customerData, ...data };
    this.events.emit("customer:changed", { customer: this._customerData }); // ← СОБЫТИЕ
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
    this.events.emit("customer:changed", { customer: this._customerData });
    this.events.emit("customer:cleared");
  }

  // ============ ПРИВАТНЫЕ МЕТОДЫ ВАЛИДАЦИИ ПОЛЕЙ ============

  private validatePayment(): { isValid: boolean; error: string } {
    if (!this._customerData.payment) {
      return { isValid: false, error: "Выберите способ оплаты" };
    }
    if (
      this._customerData.payment !== "online" &&
      this._customerData.payment !== "При получении" &&
      this._customerData.payment !== "card" &&
      this._customerData.payment !== "cash"
    ) {
      return { isValid: false, error: "Неверный способ оплаты" };
    }
    return { isValid: true, error: "" };
  }

  private validateAddress(): { isValid: boolean; error: string } {
    if (!this._customerData.address.trim()) {
      return { isValid: false, error: "Введите адрес" };
    }
    return { isValid: true, error: "" };
  }

  private validateEmail(): { isValid: boolean; error: string } {
    if (!this._customerData.email.trim()) {
      return { isValid: false, error: "Введите email" };
    }
    return { isValid: true, error: "" };
  }

  private validatePhone(): { isValid: boolean; error: string } {
    if (!this._customerData.phone.trim()) {
      return { isValid: false, error: "Введите телефон" };
    }
    return { isValid: true, error: "" };
  }

  // ============ ЕДИНЫЙ МЕТОД ВАЛИДАЦИИ ============

  validate(fields?: Array<keyof ICustomer>): IValidationResult {
    const errors: Record<keyof ICustomer, string> = {
      payment: "",
      email: "",
      phone: "",
      address: "",
    };

    let isValid = true;

    // Определяем, какие поля проверять
    const fieldsToValidate =
      fields ||
      (["payment", "email", "phone", "address"] as Array<keyof ICustomer>);

    // Проверяем только нужные поля
    if (fieldsToValidate.includes("payment")) {
      const paymentValidation = this.validatePayment();
      if (!paymentValidation.isValid) {
        errors.payment = paymentValidation.error;
        isValid = false;
      }
    }

    if (fieldsToValidate.includes("address")) {
      const addressValidation = this.validateAddress();
      if (!addressValidation.isValid) {
        errors.address = addressValidation.error;
        isValid = false;
      }
    }

    if (fieldsToValidate.includes("email")) {
      const emailValidation = this.validateEmail();
      if (!emailValidation.isValid) {
        errors.email = emailValidation.error;
        isValid = false;
      }
    }

    if (fieldsToValidate.includes("phone")) {
      const phoneValidation = this.validatePhone();
      if (!phoneValidation.isValid) {
        errors.phone = phoneValidation.error;
        isValid = false;
      }
    }

    return { isValid, errors };
  }

  // Вспомогательные методы (опционально)
  get isComplete(): boolean {
    return this.validate().isValid;
  }

  get validationErrors(): Record<keyof ICustomer, string> {
    return this.validate().errors;
  }
}
