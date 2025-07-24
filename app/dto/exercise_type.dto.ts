import { ExerciseDifficulty } from '../domain/entities/exercise_type.js'

export interface CreateExerciseTypeDto {
  name: string
  description: string
  targetMuscles: string[]
  difficulty: ExerciseDifficulty
}

export interface UpdateExerciseTypeDto {
  name?: string
  description?: string
  targetMuscles?: string[]
  difficulty?: ExerciseDifficulty
}

export interface ExerciseTypeResponseDto {
  id: string
  name: string
  description: string
  targetMuscles: string[]
  difficulty: ExerciseDifficulty
  createdAt: Date
  updatedAt: Date
}

export interface ExerciseTypeListDto {
  exerciseTypes: ExerciseTypeResponseDto[]
  total: number
  page: number
  limit: number
}

export interface ExerciseTypeFiltersDto {
  difficulty?: ExerciseDifficulty
  targetMuscle?: string
}
