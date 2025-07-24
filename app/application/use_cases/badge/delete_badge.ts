import { BadgeRepository } from '../../../domain/repositories/badge_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { UserBadgeRepository } from '../../../domain/repositories/user_badge_repository.js'

export interface DeleteBadgeRequest {
  badgeId: string
  userId: string
}

export class DeleteBadge {
  constructor(
    private badgeRepository: BadgeRepository,
    private userRepository: UserRepository,
    private userBadgeRepository: UserBadgeRepository
  ) {}

  async execute(request: DeleteBadgeRequest): Promise<void> {
    const user = await this.userRepository.findById(request.userId)
    if (!user || !user.isSuperAdmin()) {
      throw new Error('Unauthorized: Only super admins can delete badges')
    }

    const badge = await this.badgeRepository.findById(request.badgeId)
    if (!badge) {
      throw new Error('Badge not found')
    }

    const userBadgeCount = await this.userBadgeRepository.countByBadgeId(request.badgeId)
    if (userBadgeCount > 0) {
      throw new Error('Cannot delete badge that has been awarded to users')
    }

    await this.badgeRepository.delete(request.badgeId)
  }
}
