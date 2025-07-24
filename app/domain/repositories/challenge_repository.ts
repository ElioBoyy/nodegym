import { Challenge, ChallengeStatus, ChallengeDifficulty } from '../entities/challenge.js'
import { PaginationOptions } from './user_repository.js'

export interface ChallengeFilters {
  status?: ChallengeStatus
  difficulty?: ChallengeDifficulty
  creatorId?: string
  gymId?: string
}

export interface ChallengeRepository {
  create(challenge: Challenge): Promise<Challenge>
  findById(id: string): Promise<Challenge | null>
  findAll(
    filters?: ChallengeFilters,
    pagination?: PaginationOptions
  ): Promise<{ challenges: Challenge[]; total: number }>
  findByCreatorId(
    creatorId: string,
    pagination?: PaginationOptions
  ): Promise<{ challenges: Challenge[]; total: number }>
  findByGymId(
    gymId: string,
    pagination?: PaginationOptions
  ): Promise<{ challenges: Challenge[]; total: number }>
  update(challenge: Challenge): Promise<Challenge>
  delete(id: string): Promise<void>
  countByStatus(status: ChallengeStatus): Promise<number>
  countByCreatorId(creatorId: string): Promise<number>
  countByGymId(gymId: string): Promise<number>
  exists(id: string): Promise<boolean>
}
