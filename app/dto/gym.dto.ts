import { GymStatus } from '../domain/entities/gym.js'

export interface CreateGymDto {
  name: string
  address: string
  contact: string
  description: string
  capacity: number
  equipment: string[]
  activities: string[]
}

export interface UpdateGymDto {
  name?: string
  address?: string
  contact?: string
  description?: string
  capacity?: number
  equipment?: string[]
  activities?: string[]
}

export interface GymResponseDto {
  id: string
  name: string
  address: string
  contact: string
  description: string
  capacity: number
  equipment: string[]
  activities: string[]
  ownerId: string
  status: GymStatus
  createdAt: Date
  updatedAt: Date
}

export interface GymListDto {
  gyms: GymResponseDto[]
  total: number
  page: number
  limit: number
}

export interface ApproveGymDto {
  approved: boolean
}

export interface GymStatsDto {
  totalChallenges: number
  activeChallenges: number
  totalParticipants: number
  activeParticipants: number
}
