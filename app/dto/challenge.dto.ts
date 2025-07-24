import { ChallengeStatus, ChallengeDifficulty } from '../domain/entities/challenge.js'

export interface CreateChallengeDto {
  title: string
  description: string
  objectives: string[]
  exerciseTypes: string[]
  duration: number
  difficulty: ChallengeDifficulty
  gymId?: string
  maxParticipants?: number
}

export interface UpdateChallengeDto {
  title?: string
  description?: string
  objectives?: string[]
  exerciseTypes?: string[]
  duration?: number
  difficulty?: ChallengeDifficulty
  maxParticipants?: number
}

export interface ChallengeResponseDto {
  id: string
  title: string
  description: string
  objectives: string[]
  exerciseTypes: string[]
  duration: number
  difficulty: ChallengeDifficulty
  creatorId: string
  gymId?: string
  status: ChallengeStatus
  maxParticipants?: number
  currentParticipants?: number
  createdAt: Date
  updatedAt: Date
}

export interface ChallengeListDto {
  challenges: ChallengeResponseDto[]
  total: number
  page: number
  limit: number
}

export interface ChallengeFiltersDto {
  status?: ChallengeStatus
  difficulty?: ChallengeDifficulty
  gymId?: string
  creatorId?: string
}

export interface ChallengeStatsDto {
  totalParticipants: number
  activeParticipants: number
  completedParticipants: number
  averageProgress: number
  totalWorkoutSessions: number
  totalCaloriesBurned: number
  totalWorkoutTime: number
}
