"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    success;
    message;
    data;
    errors;
    constructor(success, message, data, errors) {
        this.success = success;
        this.message = message;
        if (data)
            this.data = data;
        if (errors)
            this.errors = errors;
    }
    static success(message, data) {
        return new ApiResponse(true, message, data);
    }
    static error(message, errors) {
        return new ApiResponse(false, message, undefined, errors);
    }
}
exports.ApiResponse = ApiResponse;
