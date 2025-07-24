import {
  Challenge,
  ChallengeProps,
  ChallengeDifficulty,
  ChallengeStatus,
} from '../entities/challenge.js'
import { DifficultyStrategyFactory } from '../strategies/challenge_difficulty_strategy.js'

export interface CreateChallengeRequest {
  title: string
  description: string
  objectives: string[]
  exerciseTypes: string[]
  difficulty: ChallengeDifficulty
  creatorId: string
  gymId: string
  startDate?: Date
  endDate?: Date
  maxParticipants?: number
}

export class ChallengeFactory {
  static create(request: CreateChallengeRequest): Challenge {
    const strategy = DifficultyStrategyFactory.createStrategy(request.difficulty)

    const startDate = request.startDate || new Date()
    const recommendedDuration = strategy.calculateRecommendedDuration({} as Challenge)
    const endDate =
      request.endDate || new Date(startDate.getTime() + recommendedDuration * 24 * 60 * 60 * 1000)
    const maxParticipants =
      request.maxParticipants || strategy.calculateMaxParticipants({} as Challenge)

    const challengeProps: ChallengeProps = {
      title: request.title,
      description: request.description,
      objectives: request.objectives,
      exerciseTypes: request.exerciseTypes,
      duration: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
      difficulty: request.difficulty,
      creatorId: request.creatorId,
      gymId: request.gymId,
      status: ChallengeStatus.ACTIVE,
      maxParticipants,
      startDate,
      endDate,
    }

    return Challenge.create(challengeProps)
  }

  static createBeginnerChallenge(request: Omit<CreateChallengeRequest, 'difficulty'>): Challenge {
    return this.create({
      ...request,
      difficulty: ChallengeDifficulty.BEGINNER,
    })
  }

  static createIntermediateChallenge(
    request: Omit<CreateChallengeRequest, 'difficulty'>
  ): Challenge {
    return this.create({
      ...request,
      difficulty: ChallengeDifficulty.INTERMEDIATE,
    })
  }

  static createAdvancedChallenge(request: Omit<CreateChallengeRequest, 'difficulty'>): Challenge {
    return this.create({
      ...request,
      difficulty: ChallengeDifficulty.ADVANCED,
    })
  }

  static fromSnapshot(
    props: ChallengeProps & { id: string; createdAt: Date; updatedAt: Date }
  ): Challenge {
    return Challenge.fromSnapshot(props)
  }
}
