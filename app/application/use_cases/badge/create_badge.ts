import { Badge, BadgeRule } from '../../../domain/entities/badge.js'
import { BadgeRepository } from '../../../domain/repositories/badge_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'

export interface CreateBadgeRequest {
  name: string
  description: string
  iconUrl: string
  rules: BadgeRule[]
  createdBy: string
}

export class CreateBadge {
  constructor(
    private badgeRepository: BadgeRepository,
    private userRepository: UserRepository
  ) {}

  async execute(request: CreateBadgeRequest): Promise<Badge> {
    const creator = await this.userRepository.findById(request.createdBy)
    if (!creator || !creator.isSuperAdmin()) {
      throw new Error('Unauthorized: Only super admins can create badges')
    }

    const badge = new Badge({
      id: crypto.randomUUID(),
      name: request.name,
      description: request.description,
      iconUrl: request.iconUrl,
      rules: request.rules,
    })

    return await this.badgeRepository.create(badge)
  }
}
