import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { GymRepository } from '../../../domain/repositories/gym_repository.js'
import { ChallengeRepository } from '../../../domain/repositories/challenge_repository.js'
import { ChallengeParticipationRepository } from '../../../domain/repositories/challenge_participation_repository.js'
import { BadgeRepository } from '../../../domain/repositories/badge_repository.js'
import { ExerciseTypeRepository } from '../../../domain/repositories/exercise_type_repository.js'
import { UserRole } from '../../../domain/entities/user.js'
import { GymStatus } from '../../../domain/entities/gym.js'
import { ChallengeStatus } from '../../../domain/entities/challenge.js'
import { ParticipationStatus } from '../../../domain/entities/challenge_participation.js'

export interface AdminDashboardStats {
  totalUsers: number
  activeUsers: number
  totalGyms: number
  approvedGyms: number
  pendingGyms: number
  totalChallenges: number
  activeChallenges: number
  totalBadges: number
  activeBadges: number
  totalParticipations: number
  activeParticipations: number
  totalExerciseTypes: number
  usersByRole: Record<string, number>
  recentActivity: {
    newUsers: number
    newGyms: number
    newChallenges: number
  }
}

export class GetDashboardStats {
  constructor(
    private userRepository: UserRepository,
    private gymRepository: GymRepository,
    private challengeRepository: ChallengeRepository,
    private participationRepository: ChallengeParticipationRepository,
    private badgeRepository: BadgeRepository,
    private exerciseTypeRepository: ExerciseTypeRepository
  ) {}

  async execute(adminId: string): Promise<AdminDashboardStats> {
    const admin = await this.userRepository.findById(adminId)
    if (!admin || !admin.isSuperAdmin()) {
      throw new Error('Unauthorized: Only super admins can access dashboard stats')
    }

    const [
      totalUsers,
      activeUsers,
      totalGyms,
      approvedGyms,
      pendingGyms,
      totalChallenges,
      activeChallenges,
      totalBadges,
      activeBadges,
      totalParticipations,
      activeParticipations,
      exerciseTypesResult,
      clientCount,
      gymOwnerCount,
      superAdminCount,
    ] = await Promise.all([
      this.userRepository.findAll().then((result) => result.total),
      this.userRepository.countActive(),
      this.gymRepository.findAll().then((result) => result.total),
      this.gymRepository.countByStatus(GymStatus.APPROVED),
      this.gymRepository.countByStatus(GymStatus.PENDING),
      this.challengeRepository.findAll().then((result) => result.total),
      this.challengeRepository.countByStatus(ChallengeStatus.ACTIVE),
      this.badgeRepository.findAll().then((result) => result.total),
      this.badgeRepository.countActive(),
      this.participationRepository.findAll().then((result) => result.total),
      this.participationRepository.countByStatus(ParticipationStatus.ACTIVE),
      this.exerciseTypeRepository.findAll().then((result) => result.total),
      this.userRepository.countByRole(UserRole.CLIENT),
      this.userRepository.countByRole(UserRole.GYM_OWNER),
      this.userRepository.countByRole(UserRole.SUPER_ADMIN),
    ])

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    return {
      totalUsers,
      activeUsers,
      totalGyms,
      approvedGyms,
      pendingGyms,
      totalChallenges,
      activeChallenges,
      totalBadges,
      activeBadges,
      totalParticipations,
      activeParticipations,
      totalExerciseTypes: exerciseTypesResult,
      usersByRole: {
        client: clientCount,
        gym_owner: gymOwnerCount,
        super_admin: superAdminCount,
      },
      recentActivity: {
        newUsers: 0,
        newGyms: 0,
        newChallenges: 0,
      },
    }
  }
}
