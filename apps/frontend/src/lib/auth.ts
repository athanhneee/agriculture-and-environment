export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
};

export type LoginResponse = {
  user: AuthUser;
  accessToken: string;
};

export type RegisterResponse = AuthUser;

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};
