import { Badge, BadgeRule } from '../../../domain/entities/badge.js'
import { BadgeRepository } from '../../../domain/repositories/badge_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'

export interface UpdateBadgeRequest {
  badgeId: string
  userId: string
  name?: string
  description?: string
  iconUrl?: string
  rules?: BadgeRule[]
}

export class UpdateBadge {
  constructor(
    private badgeRepository: BadgeRepository,
    private userRepository: UserRepository
  ) {}

  async execute(request: UpdateBadgeRequest): Promise<Badge> {
    const user = await this.userRepository.findById(request.userId)
    if (!user || !user.isSuperAdmin()) {
      throw new Error('Unauthorized: Only super admins can update badges')
    }

    const badge = await this.badgeRepository.findById(request.badgeId)
    if (!badge) {
      throw new Error('Badge not found')
    }

    const updatedBadge = badge.update({
      name: request.name,
      description: request.description,
      iconUrl: request.iconUrl,
      rules: request.rules,
    })

    return await this.badgeRepository.update(updatedBadge)
  }
}
