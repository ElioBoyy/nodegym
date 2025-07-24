import { Challenge, ChallengeDifficulty } from '../../../domain/entities/challenge.js'
import { ChallengeRepository } from '../../../domain/repositories/challenge_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { GymRepository } from '../../../domain/repositories/gym_repository.js'

export interface CreateChallengeRequest {
  title: string
  description: string
  objectives: string[]
  exerciseTypes: string[]
  duration: number
  difficulty: ChallengeDifficulty
  creatorId: string
  gymId?: string
  maxParticipants?: number
}

export class CreateChallenge {
  constructor(
    private challengeRepository: ChallengeRepository,
    private userRepository: UserRepository,
    private gymRepository: GymRepository
  ) {}

  async execute(request: CreateChallengeRequest): Promise<Challenge> {
    const creator = await this.userRepository.findById(request.creatorId)
    if (!creator) {
      throw new Error('Creator not found')
    }

    if (request.gymId) {
      const gym = await this.gymRepository.findById(request.gymId)
      if (!gym) {
        throw new Error('Gym not found')
      }

      if (!gym.isApproved()) {
        throw new Error('Gym must be approved to create challenges')
      }

      if (creator.isGymOwner() && !gym.belongsTo(request.creatorId)) {
        throw new Error('Gym owner can only create challenges for their own gym')
      }
    }

    const challenge = Challenge.create({
      title: request.title,
      description: request.description,
      objectives: request.objectives,
      exerciseTypes: request.exerciseTypes,
      duration: request.duration,
      difficulty: request.difficulty,
      creatorId: request.creatorId,
      gymId: request.gymId,
      maxParticipants: request.maxParticipants,
    })

    return await this.challengeRepository.create(challenge)
  }
}
