export type Role = 'ADMIN' | 'EDITOR' | 'VIEWER';

export interface User {
  id: number,
  name: string,
  email: string,
  role: Role,
  createdAt: string
}

export interface AuthResponse {
  user: User,
  accessToken: string
}


