export enum UserRole {
  PARENT = 'PARENT',
  COACH = 'COACH',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface AuthTokens {
  accessToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  childFirstName: string;
  childLastName: string;
  childBirthDate: string;
  childGender: 'MALE' | 'FEMALE';
}

export const ROLE_DASHBOARD_PATH: Record<UserRole, string> = {
  [UserRole.PARENT]: '/parent/dashboard',
  [UserRole.COACH]: '/coach/dashboard',
  [UserRole.ADMIN]: '/admin/dashboard',
};

export const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/coaches',
  '/schedule',
  '/pricing',
  '/news',
  '/gallery',
  '/contacts',
  '/privacy',
  '/terms',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
] as const;
