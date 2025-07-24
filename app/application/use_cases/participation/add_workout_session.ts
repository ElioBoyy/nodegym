import { ChallengeParticipation } from '../../../domain/entities/challenge_participation.js'
import { ChallengeParticipationRepository } from '../../../domain/repositories/challenge_participation_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { BadgeService } from '../../../domain/services/badge_service.js'
import { NotificationService } from '../../../domain/services/notification_service.js'

export interface AddWorkoutSessionRequest {
  participationId: string
  userId: string
  duration: number
  caloriesBurned: number
  exercisesCompleted: string[]
  notes?: string
  date?: Date
}

export class AddWorkoutSession {
  constructor(
    private participationRepository: ChallengeParticipationRepository,
    private userRepository: UserRepository,
    private badgeService: BadgeService,
    private notificationService: NotificationService
  ) {}

  async execute(request: AddWorkoutSessionRequest): Promise<ChallengeParticipation> {
    const user = await this.userRepository.findById(request.userId)
    if (!user) {
      throw new Error('User not found')
    }

    const participation = await this.participationRepository.findById(request.participationId)
    if (!participation) {
      throw new Error('Participation not found')
    }

    if (!participation.belongsToUser(request.userId)) {
      throw new Error('Unauthorized: Can only add sessions to own participations')
    }

    if (!participation.isActive()) {
      throw new Error('Cannot add sessions to inactive participation')
    }

    const updatedParticipation = participation.addWorkoutSession({
      duration: request.duration,
      caloriesBurned: request.caloriesBurned,
      exercisesCompleted: request.exercisesCompleted,
      notes: request.notes,
      date: request.date ?? new Date(),
    })

    const savedParticipation = await this.participationRepository.update(updatedParticipation)

    const eligibleBadges = await this.badgeService.getEligibleBadges(request.userId)
    for (const badge of eligibleBadges) {
      await this.badgeService.awardBadgeToUser(request.userId, badge.id, participation.challengeId)
    }

    return savedParticipation
  }
}
