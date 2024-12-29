export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  meta?: {
    pagination?: PaginationParams;
  };
}