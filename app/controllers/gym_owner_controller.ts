import type { HttpContext } from '@adonisjs/core/http'
import '../types/http.js'
import { GetGymStats } from '../application/use_cases/gym_owner/get_gym_stats.js'
import { GetGymChallenges } from '../application/use_cases/gym_owner/get_gym_challenges.js'
import { UpdateGym } from '../application/use_cases/gym/update_gym.js'
import { GymRepository } from '../domain/repositories/gym_repository.js'
import { UpdateGymDto, GymResponseDto } from '../dto/gym.dto.js'

export default class GymOwnerController {
  constructor(
    private getGymStatsUseCase: GetGymStats,
    private getGymChallengesUseCase: GetGymChallenges,
    private updateGymUseCase: UpdateGym,
    private gymRepository: GymRepository
  ) {}

  async myGym({ response, auth }: HttpContext) {
    try {
      if (!auth) {
        return response.status(401).json({ error: 'Authentication required' })
      }
      const userId = auth.getUserId()
      const gym = await this.gymRepository.findByOwnerId(userId)

      if (!gym) {
        return response.status(404).json({ error: 'Gym not found' })
      }

      return response.json(this.mapToGymResponse(gym))
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async updateMyGym({ request, response, auth }: HttpContext) {
    try {
      if (!auth) {
        return response.status(401).json({ error: 'Authentication required' })
      }
      const data = request.body() as UpdateGymDto
      const userId = auth.getUserId()

      const gym = await this.gymRepository.findByOwnerId(userId)
      if (!gym) {
        return response.status(404).json({ error: 'Gym not found' })
      }

      const updatedGym = await this.updateGymUseCase.execute({
        gymId: gym.id,
        userId,
        ...data,
      })

      return response.json(this.mapToGymResponse(updatedGym))
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
      const stats = await this.getGymStatsUseCase.execute(userId)
      return response.json(stats)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async myGymChallenges({ request, response, auth }: HttpContext) {
    try {
      if (!auth) {
        return response.status(401).json({ error: 'Authentication required' })
      }
      const userId = auth.getUserId()
      const page = Number(request.input('page', 1))
      const limit = Number(request.input('limit', 10))

      const result = await this.getGymChallengesUseCase.execute({
        userId,
        pagination: { page, limit },
      })

      return response.json({
        challenges: result.challenges.map((challenge) => this.mapToChallengeResponse(challenge)),
        total: result.total,
        page: result.page,
        limit: result.limit,
      })
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  private mapToGymResponse(gym: any): GymResponseDto {
    return {
      id: gym.id,
      name: gym.name,
      address: gym.address,
      contact: gym.contact,
      description: gym.description,
      capacity: gym.capacity,
      equipment: gym.equipment,
      activities: gym.activities,
      ownerId: gym.ownerId,
      status: gym.status,
      createdAt: gym.createdAt,
      updatedAt: gym.updatedAt,
    }
  }

  private mapToChallengeResponse(challenge: any) {
    return {
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      objectives: challenge.objectives,
      exerciseTypes: challenge.exerciseTypes,
      duration: challenge.duration,
      difficulty: challenge.difficulty,
      creatorId: challenge.creatorId,
      gymId: challenge.gymId,
      status: challenge.status,
      maxParticipants: challenge.maxParticipants,
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt,
    }
  }
}
