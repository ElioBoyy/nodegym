import { Challenge } from '../entities/challenge.js'
import { User } from '../entities/user.js'
import { ChallengeParticipation } from '../entities/challenge_participation.js'

export interface ChallengeService {
  canUserCreateChallenge(user: User): boolean
  canUserJoinChallenge(user: User, challenge: Challenge, currentParticipants: number): boolean
  canUserLeaveChallenge(user: User, participation: ChallengeParticipation): boolean
  calculateChallengeProgress(participation: ChallengeParticipation): number
  isEligibleForCompletion(participation: ChallengeParticipation): boolean
}

export class DomainChallengeService implements ChallengeService {
  canUserCreateChallenge(user: User): boolean {
    return user.isActive && (user.role === 'gym_owner' || user.role === 'super_admin')
  }

  canUserJoinChallenge(user: User, challenge: Challenge, currentParticipants: number): boolean {
    if (!user.isActive || user.role !== 'client') {
      return false
    }

    if (!challenge.isActive()) {
      return false
    }

    if (!challenge.canAcceptParticipants(currentParticipants)) {
      return false
    }

    const now = new Date()
    return challenge.startDate <= now && challenge.endDate >= now
  }

  canUserLeaveChallenge(user: User, participation: ChallengeParticipation): boolean {
    if (participation.userId !== user.id) {
      return false
    }

    return participation.isActive() && !participation.isCompleted()
  }

  calculateChallengeProgress(participation: ChallengeParticipation): number {
    const totalSessions = participation.workoutSessions.length
    const requiredSessions = 10

    return Math.min((totalSessions / requiredSessions) * 100, 100)
  }

  isEligibleForCompletion(participation: ChallengeParticipation): boolean {
    return this.calculateChallengeProgress(participation) >= 100
  }
}
