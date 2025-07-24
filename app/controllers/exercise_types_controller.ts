import type { HttpContext } from '@adonisjs/core/http'
import { GetExerciseTypes } from '../application/use_cases/exercise_type/get_exercise_types.js'
import { GetExerciseTypeById } from '../application/use_cases/exercise_type/get_exercise_type_by_id.js'
import { ExerciseTypeResponseDto, ExerciseTypeListDto } from '../dto/exercise_type.dto.js'

export default class ExerciseTypesController {
  constructor(
    private getExerciseTypesUseCase: GetExerciseTypes,
    private getExerciseTypeByIdUseCase: GetExerciseTypeById
  ) {}

  async index({ request, response }: HttpContext) {
    try {
      const page = Number(request.input('page', 1))
      const limit = Number(request.input('limit', 10))
      const difficulty = request.input('difficulty')
      const targetMuscle = request.input('targetMuscle')

      const result = await this.getExerciseTypesUseCase.execute({
        filters: { difficulty, targetMuscle },
        pagination: { page, limit },
      })

      const exerciseTypeListDto: ExerciseTypeListDto = {
        exerciseTypes: result.exerciseTypes.map((exerciseType) =>
          this.mapToExerciseTypeResponse(exerciseType)
        ),
        total: result.total,
        page: result.page,
        limit: result.limit,
      }

      return response.json(exerciseTypeListDto)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const exerciseType = await this.getExerciseTypeByIdUseCase.execute(params.id)
      return response.json(this.mapToExerciseTypeResponse(exerciseType))
    } catch (error) {
      return response.status(404).json({ error: error.message })
    }
  }

  private mapToExerciseTypeResponse(exerciseType: any): ExerciseTypeResponseDto {
    return {
      id: exerciseType.id,
      name: exerciseType.name,
      description: exerciseType.description,
      targetMuscles: exerciseType.targetMuscles,
      difficulty: exerciseType.difficulty,
      createdAt: exerciseType.createdAt,
      updatedAt: exerciseType.updatedAt,
    }
  }
}
