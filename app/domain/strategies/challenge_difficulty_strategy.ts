import { Challenge, ChallengeDifficulty } from '../entities/challenge.js'

export interface ChallengeDifficultyStrategy {
  calculateDifficulty(challenge: Challenge): ChallengeDifficulty
  calculateRecommendedDuration(challenge: Challenge): number
  calculateMaxParticipants(challenge: Challenge): number
}

export class BeginnerDifficultyStrategy implements ChallengeDifficultyStrategy {
  calculateDifficulty(challenge: Challenge): ChallengeDifficulty {
    return ChallengeDifficulty.BEGINNER
  }

  calculateRecommendedDuration(challenge: Challenge): number {
    return 7
  }

  calculateMaxParticipants(challenge: Challenge): number {
    return 50
  }
}

export class IntermediateDifficultyStrategy implements ChallengeDifficultyStrategy {
  calculateDifficulty(challenge: Challenge): ChallengeDifficulty {
    return ChallengeDifficulty.INTERMEDIATE
  }

  calculateRecommendedDuration(challenge: Challenge): number {
    return 14
  }

  calculateMaxParticipants(challenge: Challenge): number {
    return 30
  }
}

export class AdvancedDifficultyStrategy implements ChallengeDifficultyStrategy {
  calculateDifficulty(challenge: Challenge): ChallengeDifficulty {
    return ChallengeDifficulty.ADVANCED
  }

  calculateRecommendedDuration(challenge: Challenge): number {
    return 30
  }

  calculateMaxParticipants(challenge: Challenge): number {
    return 15
  }
}

export class ChallengeDifficultyContext {
  private strategy: ChallengeDifficultyStrategy

  constructor(strategy: ChallengeDifficultyStrategy) {
    this.strategy = strategy
  }

  setStrategy(strategy: ChallengeDifficultyStrategy): void {
    this.strategy = strategy
  }

  calculateDifficulty(challenge: Challenge): ChallengeDifficulty {
    return this.strategy.calculateDifficulty(challenge)
  }

  calculateRecommendedDuration(challenge: Challenge): number {
    return this.strategy.calculateRecommendedDuration(challenge)
  }

  calculateMaxParticipants(challenge: Challenge): number {
    return this.strategy.calculateMaxParticipants(challenge)
  }
}

export class DifficultyStrategyFactory {
  static createStrategy(difficulty: ChallengeDifficulty): ChallengeDifficultyStrategy {
    switch (difficulty) {
      case ChallengeDifficulty.BEGINNER:
        return new BeginnerDifficultyStrategy()
      case ChallengeDifficulty.INTERMEDIATE:
        return new IntermediateDifficultyStrategy()
      case ChallengeDifficulty.ADVANCED:
        return new AdvancedDifficultyStrategy()
      default:
        return new BeginnerDifficultyStrategy()
    }
  }
}
