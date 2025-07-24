import type { HttpContext } from '@adonisjs/core/http'
import '../types/http.js'
import { GetBadges } from '../application/use_cases/badge/get_badges.js'
import { GetBadgeById } from '../application/use_cases/badge/get_badge_by_id.js'
import { GetUserBadges } from '../application/use_cases/badge/get_user_badges.js'
import { BadgeResponseDto, BadgeListDto, UserBadgeResponseDto } from '../dto/badge.dto.js'

export default class BadgesController {
  constructor(
    private getBadgesUseCase: GetBadges,
    private getBadgeByIdUseCase: GetBadgeById,
    private getUserBadgesUseCase: GetUserBadges
  ) {}

  async index({ request, response }: HttpContext) {
    try {
      const page = Number(request.input('page', 1))
      const limit = Number(request.input('limit', 10))
      const isActive = request.input('isActive')

      const result = await this.getBadgesUseCase.execute({
        filters: { isActive: isActive !== undefined ? Boolean(isActive) : undefined },
        pagination: { page, limit },
      })

      const badgeListDto: BadgeListDto = {
        badges: result.badges.map((badge) => this.mapToBadgeResponse(badge)),
        total: result.total,
        page: result.page,
        limit: result.limit,
      }

      return response.json(badgeListDto)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const badge = await this.getBadgeByIdUseCase.execute(params.id)
      return response.json(this.mapToBadgeResponse(badge))
    } catch (error) {
      return response.status(404).json({ error: error.message })
    }
  }

  async myBadges({ request, response, auth }: HttpContext) {
    try {
      if (!auth) {
        return response.status(401).json({ error: 'Authentication required' })
      }
      const userId = auth.getUserId()
      const page = Number(request.input('page', 1))
      const limit = Number(request.input('limit', 10))

      const result = await this.getUserBadgesUseCase.execute({
        userId,
        pagination: { page, limit },
      })

      return response.json({
        badges: result.userBadges.map((userBadge) => this.mapToUserBadgeResponse(userBadge)),
        total: result.total,
        page: result.page,
        limit: result.limit,
      })
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  private mapToBadgeResponse(badge: any): BadgeResponseDto {
    return {
      id: badge.id,
      name: badge.name,
      description: badge.description,
      iconUrl: badge.iconUrl,
      rules: badge.rules,
      isActive: badge.isActive,
      createdAt: badge.createdAt,
      updatedAt: badge.updatedAt,
    }
  }

  private mapToUserBadgeResponse(userBadge: any): UserBadgeResponseDto {
    return {
      id: userBadge.id,
      userId: userBadge.userId,
      badgeId: userBadge.badgeId,
      badge: this.mapToBadgeResponse(userBadge.badge),
      earnedAt: userBadge.earnedAt,
      relatedChallengeId: userBadge.relatedChallengeId,
      metadata: userBadge.metadata,
    }
  }
}
