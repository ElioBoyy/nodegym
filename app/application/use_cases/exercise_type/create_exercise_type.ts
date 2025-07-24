import { ExerciseType, ExerciseDifficulty } from '../../../domain/entities/exercise_type.js'
import { ExerciseTypeRepository } from '../../../domain/repositories/exercise_type_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'

export interface CreateExerciseTypeRequest {
  name: string
  description: string
  targetMuscles: string[]
  difficulty: ExerciseDifficulty
  createdBy: string
}

export class CreateExerciseType {
  constructor(
    private exerciseTypeRepository: ExerciseTypeRepository,
    private userRepository: UserRepository
  ) {}

  async execute(request: CreateExerciseTypeRequest): Promise<ExerciseType> {
    const creator = await this.userRepository.findById(request.createdBy)
    if (!creator || !creator.isSuperAdmin()) {
      throw new Error('Unauthorized: Only super admins can create exercise types')
    }

    const exerciseType = new ExerciseType({
      id: crypto.randomUUID(),
      name: request.name,
      description: request.description,
      targetMuscles: request.targetMuscles,
      difficulty: request.difficulty,
    })

    return await this.exerciseTypeRepository.create(exerciseType)
  }
}
