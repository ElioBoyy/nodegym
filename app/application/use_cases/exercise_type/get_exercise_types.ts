import { ExerciseType } from '../../../domain/entities/exercise_type.js'
import {
  ExerciseTypeRepository,
  ExerciseTypeFilters,
} from '../../../domain/repositories/exercise_type_repository.js'
import { PaginationOptions } from '../../../domain/repositories/user_repository.js'

export interface GetExerciseTypesRequest {
  filters?: ExerciseTypeFilters
  pagination?: PaginationOptions
}

export interface GetExerciseTypesResponse {
  exerciseTypes: ExerciseType[]
  total: number
  page: number
  limit: number
}

export class GetExerciseTypes {
  constructor(private exerciseTypeRepository: ExerciseTypeRepository) {}

  async execute(request: GetExerciseTypesRequest = {}): Promise<GetExerciseTypesResponse> {
    const { exerciseTypes, total } = await this.exerciseTypeRepository.findAll(
      request.filters,
      request.pagination
    )

    return {
      exerciseTypes,
      total,
      page: request.pagination?.page ?? 1,
      limit: request.pagination?.limit ?? 10,
    }
  }
}
