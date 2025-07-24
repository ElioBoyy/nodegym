import { Badge } from '../../../domain/entities/badge.js'
import { BadgeRepository } from '../../../domain/repositories/badge_repository.js'

export class GetBadgeById {
  constructor(private badgeRepository: BadgeRepository) {}

  async execute(id: string): Promise<Badge> {
    const badge = await this.badgeRepository.findById(id)
    if (!badge) {
      throw new Error('Badge not found')
    }

    return badge
  }
}
