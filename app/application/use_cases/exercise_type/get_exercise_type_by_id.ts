import { ExerciseType } from '../../../domain/entities/exercise_type.js'
import { ExerciseTypeRepository } from '../../../domain/repositories/exercise_type_repository.js'

export class GetExerciseTypeById {
  constructor(private exerciseTypeRepository: ExerciseTypeRepository) {}

  async execute(id: string): Promise<ExerciseType> {
    const exerciseType = await this.exerciseTypeRepository.findById(id)
    if (!exerciseType) {
      throw new Error('Exercise type not found')
    }

    return exerciseType
  }
}
