import { User, UserRole } from '../entities/user.js'

export interface UserFilters {
  role?: UserRole
  isActive?: boolean
  email?: string
}

export interface PaginationOptions {
  page: number
  limit: number
}

export interface UserRepository {
  create(user: User): Promise<User>
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findAll(
    filters?: UserFilters,
    pagination?: PaginationOptions
  ): Promise<{ users: User[]; total: number }>
  update(user: User): Promise<User>
  delete(id: string): Promise<void>
  countByRole(role: UserRole): Promise<number>
  countActive(): Promise<number>
  exists(id: string): Promise<boolean>
}
