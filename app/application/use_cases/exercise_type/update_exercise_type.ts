import { ExerciseType, ExerciseDifficulty } from '../../../domain/entities/exercise_type.js'
import { ExerciseTypeRepository } from '../../../domain/repositories/exercise_type_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'

export interface UpdateExerciseTypeRequest {
  exerciseTypeId: string
  userId: string
  name?: string
  description?: string
  targetMuscles?: string[]
  difficulty?: ExerciseDifficulty
}

export class UpdateExerciseType {
  constructor(
    private exerciseTypeRepository: ExerciseTypeRepository,
    private userRepository: UserRepository
  ) {}

  async execute(request: UpdateExerciseTypeRequest): Promise<ExerciseType> {
    const user = await this.userRepository.findById(request.userId)
    if (!user || !user.isSuperAdmin()) {
      throw new Error('Unauthorized: Only super admins can update exercise types')
    }

    const exerciseType = await this.exerciseTypeRepository.findById(request.exerciseTypeId)
    if (!exerciseType) {
      throw new Error('Exercise type not found')
    }

    const updatedExerciseType = exerciseType.update({
      name: request.name,
      description: request.description,
      targetMuscles: request.targetMuscles,
      difficulty: request.difficulty,
    })

    return await this.exerciseTypeRepository.update(updatedExerciseType)
  }
}
