import { ChallengeParticipation, ParticipationStatus } from '../entities/challenge_participation.js'
import { PaginationOptions } from './user_repository.js'

export interface ParticipationFilters {
  status?: ParticipationStatus
  userId?: string
  challengeId?: string
}

export interface ChallengeParticipationRepository {
  create(participation: ChallengeParticipation): Promise<ChallengeParticipation>
  findById(id: string): Promise<ChallengeParticipation | null>
  findByUserAndChallenge(
    userId: string,
    challengeId: string
  ): Promise<ChallengeParticipation | null>
  findAll(
    filters?: ParticipationFilters,
    pagination?: PaginationOptions
  ): Promise<{ participations: ChallengeParticipation[]; total: number }>
  findByUserId(
    userId: string,
    pagination?: PaginationOptions
  ): Promise<{ participations: ChallengeParticipation[]; total: number }>
  findByChallengeId(
    challengeId: string,
    pagination?: PaginationOptions
  ): Promise<{ participations: ChallengeParticipation[]; total: number }>
  update(participation: ChallengeParticipation): Promise<ChallengeParticipation>
  delete(id: string): Promise<void>
  countByChallengeId(challengeId: string): Promise<number>
  countByUserId(userId: string): Promise<number>
  countByStatus(status: ParticipationStatus): Promise<number>
  exists(id: string): Promise<boolean>
  existsByUserAndChallenge(userId: string, challengeId: string): Promise<boolean>
}
