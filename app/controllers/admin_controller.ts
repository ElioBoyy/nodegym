import type { HttpContext } from '@adonisjs/core/http'
import { GetDashboardStats } from '../application/use_cases/admin/get_dashboard_stats.js'
import { GetUsers } from '../application/use_cases/user/get_users.js'
import { GetUserById } from '../application/use_cases/user/get_user_by_id.js'
import { ActivateUser } from '../application/use_cases/user/activate_user.js'
import { DeactivateUser } from '../application/use_cases/user/deactivate_user.js'
import { ApproveGym } from '../application/use_cases/gym/approve_gym.js'
import { GetPendingGyms } from '../application/use_cases/gym/get_pending_gyms.js'
import { CreateBadge } from '../application/use_cases/badge/create_badge.js'
import { GetBadges } from '../application/use_cases/badge/get_badges.js'
import { UpdateBadge } from '../application/use_cases/badge/update_badge.js'
import { DeleteBadge } from '../application/use_cases/badge/delete_badge.js'
import { CreateExerciseType } from '../application/use_cases/exercise_type/create_exercise_type.js'
import { GetExerciseTypes } from '../application/use_cases/exercise_type/get_exercise_types.js'
import { UpdateExerciseType } from '../application/use_cases/exercise_type/update_exercise_type.js'
import { DeleteExerciseType } from '../application/use_cases/exercise_type/delete_exercise_type.js'

export default class AdminController {
  constructor(
    private getDashboardStatsUseCase: GetDashboardStats,
    private getUsersUseCase: GetUsers,
    private getUserByIdUseCase: GetUserById,
    private activateUserUseCase: ActivateUser,
    private deactivateUserUseCase: DeactivateUser,
    private approveGymUseCase: ApproveGym,
    private getPendingGymsUseCase: GetPendingGyms,
    private createBadgeUseCase: CreateBadge,
    private getBadgesUseCase: GetBadges,
    private updateBadgeUseCase: UpdateBadge,
    private deleteBadgeUseCase: DeleteBadge,
    private createExerciseTypeUseCase: CreateExerciseType,
    private getExerciseTypesUseCase: GetExerciseTypes,
    private updateExerciseTypeUseCase: UpdateExerciseType,
    private deleteExerciseTypeUseCase: DeleteExerciseType
  ) {}

  async getStats({ response, auth }: HttpContext) {
    try {
      const adminId = auth!.getUserId()
      const stats = await this.getDashboardStatsUseCase.execute(adminId)
      return response.json(stats)
    } catch (error) {
      return response.status(403).json({ error: error.message })
    }
  }

  async listUsers({ request, response }: HttpContext) {
    try {
      const page = Number(request.input('page', 1))
      const limit = Number(request.input('limit', 20))
      const role = request.input('role')
      const isActive = request.input('isActive')

      const result = await this.getUsersUseCase.execute({
        filters: { role, isActive: isActive !== undefined ? Boolean(isActive) : undefined },
        pagination: { page, limit },
      })

      return response.json(result)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async showUser({ params, response }: HttpContext) {
    try {
      const user = await this.getUserByIdUseCase.execute(params.id)
      return response.json(user)
    } catch (error) {
      return response.status(404).json({ error: error.message })
    }
  }

  async activateUser({ params, response, auth }: HttpContext) {
    try {
      const adminId = auth!.getUserId()
      const user = await this.activateUserUseCase.execute(params.id, adminId)
      return response.json(user)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async deactivateUser({ params, request, response, auth }: HttpContext) {
    try {
      const adminId = auth!.getUserId()
      const { reason } = request.body() || {}
      const user = await this.deactivateUserUseCase.execute(params.id, adminId, reason)
      return response.json(user)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async pendingGyms({ request, response }: HttpContext) {
    try {
      const page = Number(request.input('page', 1))
      const limit = Number(request.input('limit', 10))

      const result = await this.getPendingGymsUseCase.execute({
        pagination: { page, limit },
      })

      return response.json(result)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async approveGym({ params, request, response, auth }: HttpContext) {
    try {
      const adminId = auth!.getUserId()
      const { approved } = request.body()

      const gym = await this.approveGymUseCase.execute({
        gymId: params.id,
        adminId,
        approved,
      })

      return response.json(gym)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async createBadge({ request, response, auth }: HttpContext) {
    try {
      const createdBy = auth!.getUserId()
      const data = request.body()

      const badge = await this.createBadgeUseCase.execute({ ...data, createdBy } as any)
      return response.status(201).json(badge)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async listBadges({ request, response }: HttpContext) {
    try {
      const page = Number(request.input('page', 1))
      const limit = Number(request.input('limit', 20))
      const isActive = request.input('isActive')

      const result = await this.getBadgesUseCase.execute({
        filters: { isActive: isActive !== undefined ? Boolean(isActive) : undefined },
        pagination: { page, limit },
      })

      return response.json(result)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async updateBadge({ params, request, response, auth }: HttpContext) {
    try {
      const userId = auth!.getUserId()
      const data = request.body()

      const badge = await this.updateBadgeUseCase.execute({
        badgeId: params.id,
        userId,
        ...data,
      })

      return response.json(badge)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async deleteBadge({ params, response, auth }: HttpContext) {
    try {
      const userId = auth!.getUserId()

      await this.deleteBadgeUseCase.execute({
        badgeId: params.id,
        userId,
      })

      return response.status(204).send('')
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async createExerciseType({ request, response, auth }: HttpContext) {
    try {
      const createdBy = auth!.getUserId()
      const data = request.body()

      const exerciseType = await this.createExerciseTypeUseCase.execute({
        ...data,
        createdBy,
      } as any)
      return response.status(201).json(exerciseType)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async listExerciseTypes({ request, response }: HttpContext) {
    try {
      const page = Number(request.input('page', 1))
      const limit = Number(request.input('limit', 20))
      const difficulty = request.input('difficulty')
      const targetMuscle = request.input('targetMuscle')

      const result = await this.getExerciseTypesUseCase.execute({
        filters: { difficulty, targetMuscle },
        pagination: { page, limit },
      })

      return response.json(result)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async updateExerciseType({ params, request, response, auth }: HttpContext) {
    try {
      const userId = auth!.getUserId()
      const data = request.body()

      const exerciseType = await this.updateExerciseTypeUseCase.execute({
        exerciseTypeId: params.id,
        userId,
        ...data,
      })

      return response.json(exerciseType)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async deleteExerciseType({ params, response, auth }: HttpContext) {
    try {
      const userId = auth!.getUserId()

      await this.deleteExerciseTypeUseCase.execute({
        exerciseTypeId: params.id,
        userId,
      })

      return response.status(204).send('')
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }
}
