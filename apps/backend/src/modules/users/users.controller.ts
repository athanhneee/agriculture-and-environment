import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { ApiResponse } from '../../utils/apiResponse';
import { Role, UserStatus } from '@prisma/client';

export class UsersController {
  static async listUsers(req: Request, res: Response) {
    const { role } = req.query;
    const users = await UsersService.listUsers(role as Role);
    res.status(200).json(ApiResponse.success('Lấy danh sách người dùng thành công', users));
  }

  static async createUser(req: Request, res: Response) {
    const { name, email, password, role, status } = req.body;
    
    if (!name || !email) {
      return res.status(400).json(ApiResponse.error('Tên và email là bắt buộc'));
    }

    if (role && !Object.values(Role).includes(role as Role)) {
       return res.status(400).json(ApiResponse.error('Vai trò không hợp lệ'));
    }

    if (status && !Object.values(UserStatus).includes(status as UserStatus)) {
       return res.status(400).json(ApiResponse.error('Trạng thái không hợp lệ'));
    }

    const newUser = await UsersService.createUser({
      name,
      email,
      password,
      role: role as Role,
      status: status as UserStatus
    });
    res.status(201).json(ApiResponse.success('Tạo người dùng thành công', newUser));
  }

  static async updateUser(req: Request, res: Response) {
    const { id } = req.params;
    const { name, role, status } = req.body;
    
    if (role && !Object.values(Role).includes(role as Role)) {
       return res.status(400).json(ApiResponse.error('Vai trò không hợp lệ'));
    }

    if (status && !Object.values(UserStatus).includes(status as UserStatus)) {
       return res.status(400).json(ApiResponse.error('Trạng thái không hợp lệ'));
    }

    const updatedUser = await UsersService.updateUser(id as string, {
      name,
      role: role as Role,
      status: status as UserStatus
    });
    res.status(200).json(ApiResponse.success('Cập nhật thông tin thành công', updatedUser));
  }

  static async deleteUser(req: Request, res: Response) {
    const { id } = req.params;
    await UsersService.deleteUser(id as string);
    res.status(200).json(ApiResponse.success('Xóa người dùng thành công'));
  }
}
