import { ExerciseType, ExerciseDifficulty } from '../entities/exercise_type.js'
import { PaginationOptions } from './user_repository.js'

export interface ExerciseTypeFilters {
  difficulty?: ExerciseDifficulty
  targetMuscle?: string
}

export interface ExerciseTypeRepository {
  create(exerciseType: ExerciseType): Promise<ExerciseType>
  findById(id: string): Promise<ExerciseType | null>
  findAll(
    filters?: ExerciseTypeFilters,
    pagination?: PaginationOptions
  ): Promise<{ exerciseTypes: ExerciseType[]; total: number }>
  findByDifficulty(difficulty: ExerciseDifficulty): Promise<ExerciseType[]>
  findByTargetMuscle(muscle: string): Promise<ExerciseType[]>
  update(exerciseType: ExerciseType): Promise<ExerciseType>
  delete(id: string): Promise<void>
  countByDifficulty(difficulty: ExerciseDifficulty): Promise<number>
  exists(id: string): Promise<boolean>
}
