import prisma from '../../config/prisma';
import { Role, UserStatus } from '@prisma/client';
import { PasswordUtil } from '../../utils/password';

export class UsersService {
  static async listUsers(role?: Role) {
    const whereClause = role ? { role } : {};
    return prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createUser(data: { name: string; email: string; password?: string; role?: Role; status?: UserStatus }) {
    const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingEmail) {
      throw { statusCode: 409, message: 'Email này đã được đăng ký' };
    }

    const defaultPassword = data.password || 'SmartFarm@123';
    const passwordHash = await PasswordUtil.hash(defaultPassword);

    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role || Role.USER,
        status: data.status || UserStatus.ACTIVE,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }

  static async updateUser(id: string, data: { name?: string; email?: string; role?: Role; status?: UserStatus; password?: string }) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw { statusCode: 404, message: 'Người dùng không tồn tại' };
    }

    if (data.email && data.email !== user.email) {
      const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingEmail) {
        throw { statusCode: 409, message: 'Email đã được sử dụng bởi người dùng khác' };
      }
    }

    const updateData: any = { ...data };
    if (data.password) {
      updateData.passwordHash = await PasswordUtil.hash(data.password);
      delete updateData.password;
    }

    return prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }

  static async deleteUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw { statusCode: 404, message: 'Người dùng không tồn tại' };
    }

    await prisma.user.delete({ where: { id } });
  }
}
