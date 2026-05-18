export class ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;

  constructor(success: boolean, message: string, data?: T, errors?: any) {
    this.success = success;
    this.message = message;
    if (data) this.data = data;
    if (errors) this.errors = errors;
  }

  static success<T>(message: string, data?: T) {
    return new ApiResponse<T>(true, message, data);
  }

  static error(message: string, errors?: any) {
    return new ApiResponse<null>(false, message, undefined, errors);
  }
}