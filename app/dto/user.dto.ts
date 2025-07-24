import { UserRole } from '../domain/entities/user.js'

export interface CreateUserDto {
  email: string
  password: string
  role: UserRole
}

export interface UpdateUserDto {
  email?: string
  password?: string
}

export interface UserResponseDto {
  id: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AuthUserDto {
  email: string
  password: string
}

export interface AuthResponseDto {
  user: UserResponseDto
  token: string
}

export interface UserStatsDto {
  totalChallenges: number
  activeChallenges: number
  completedChallenges: number
  totalBadges: number
  totalWorkoutTime: number
  totalCaloriesBurned: number
}

export interface UserListDto {
  users: UserResponseDto[]
  total: number
  page: number
  limit: number
}
