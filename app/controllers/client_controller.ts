import type { HttpContext } from '@adonisjs/core/http'
import '../types/http.js'
import { GetDashboardData } from '../application/use_cases/client/get_dashboard_data.js'
import { GetUserStats } from '../application/use_cases/client/get_user_stats.js'
import { GetWorkoutHistory } from '../application/use_cases/client/get_workout_history.js'
import { GetUserParticipations } from '../application/use_cases/participation/get_user_participations.js'
import { GetUserBadges } from '../application/use_cases/badge/get_user_badges.js'

export default class ClientController {
  constructor(
    private getDashboardDataUseCase: GetDashboardData,
    private getUserStatsUseCase: GetUserStats,
    private getWorkoutHistoryUseCase: GetWorkoutHistory,
    private getUserParticipationsUseCase: GetUserParticipations,
    private getUserBadgesUseCase: GetUserBadges
  ) {}

  async dashboard({ response, auth }: HttpContext) {
    try {
      if (!auth) {
        return response.status(401).json({ error: 'Authentication required' })
      }
      const userId = auth.getUserId()
      const dashboardData = await this.getDashboardDataUseCase.execute(userId)
      return response.json(dashboardData)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async getStats({ response, auth }: HttpContext) {
    try {
      if (!auth) {
        return response.status(401).json({ error: 'Authentication required' })
      }
      const userId = auth.getUserId()
      const stats = await this.getUserStatsUseCase.execute(userId)
      return response.json(stats)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async workoutHistory({ request, response, auth }: HttpContext) {
    try {
      if (!auth) {
        return response.status(401).json({ error: 'Authentication required' })
      }
      const userId = auth.getUserId()
      const page = Number(request.input('page', 1))
      const limit = Number(request.input('limit', 10))

      const result = await this.getWorkoutHistoryUseCase.execute({
        userId,
        pagination: { page, limit },
      })

      return response.json(result)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async myChallenges({ request, response, auth }: HttpContext) {
    try {
      if (!auth) {
        return response.status(401).json({ error: 'Authentication required' })
      }
      const userId = auth.getUserId()
      const page = Number(request.input('page', 1))
      const limit = Number(request.input('limit', 10))
      const status = request.input('status')

      const result = await this.getUserParticipationsUseCase.execute({
        userId,
        filters: { status },
        pagination: { page, limit },
      })

      return response.json(result)
    } catch (error) {
      return response.status(400).json({ error: error.message })
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

      return response.json(result)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }
}
