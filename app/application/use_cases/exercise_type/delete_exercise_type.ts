import { ExerciseTypeRepository } from '../../../domain/repositories/exercise_type_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'

export interface DeleteExerciseTypeRequest {
  exerciseTypeId: string
  userId: string
}

export class DeleteExerciseType {
  constructor(
    private exerciseTypeRepository: ExerciseTypeRepository,
    private userRepository: UserRepository
  ) {}

  async execute(request: DeleteExerciseTypeRequest): Promise<void> {
    const user = await this.userRepository.findById(request.userId)
    if (!user || !user.isSuperAdmin()) {
      throw new Error('Unauthorized: Only super admins can delete exercise types')
    }

    const exerciseType = await this.exerciseTypeRepository.findById(request.exerciseTypeId)
    if (!exerciseType) {
      throw new Error('Exercise type not found')
    }

    await this.exerciseTypeRepository.delete(request.exerciseTypeId)
  }
}
