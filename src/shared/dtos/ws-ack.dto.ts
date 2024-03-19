export class WsAck<T = any> {
  success: boolean;
  message: string;
  data?: T;

  constructor(message: string, data?: T, success?: boolean) {
    this.success = success ?? true;
    this.message = message;
    this.data = data;
  }
}
