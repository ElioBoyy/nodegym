import { ParticipationStatus } from '../domain/entities/challenge_participation.js'

export interface CreateWorkoutSessionDto {
  duration: number
  caloriesBurned: number
  exercisesCompleted: string[]
  notes?: string
  date?: Date
}

export interface UpdateWorkoutSessionDto {
  duration?: number
  caloriesBurned?: number
  exercisesCompleted?: string[]
  notes?: string
  date?: Date
}

export interface WorkoutSessionResponseDto {
  id: string
  date: Date
  duration: number
  caloriesBurned: number
  exercisesCompleted: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface ParticipationResponseDto {
  id: string
  challengeId: string
  userId: string
  status: ParticipationStatus
  progress: number
  workoutSessions: WorkoutSessionResponseDto[]
  joinedAt: Date
  completedAt?: Date
  updatedAt: Date
}

export interface ParticipationListDto {
  participations: ParticipationResponseDto[]
  total: number
  page: number
  limit: number
}

export interface ParticipationFiltersDto {
  status?: ParticipationStatus
  challengeId?: string
  userId?: string
}

export interface ParticipationStatsDto {
  totalWorkoutSessions: number
  totalCaloriesBurned: number
  totalWorkoutTime: number
  averageSessionDuration: number
  averageCaloriesPerSession: number
  progress: number
}

export interface WorkoutHistoryDto {
  sessions: WorkoutSessionResponseDto[]
  stats: ParticipationStatsDto
  total: number
  page: number
  limit: number
}
