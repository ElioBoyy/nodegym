import type { HttpContext } from '@adonisjs/core/http'
import '../types/http.js'
import { CreateGym } from '../application/use_cases/gym/create_gym.js'
import { GetGymById } from '../application/use_cases/gym/get_gym_by_id.js'
import { GetGyms } from '../application/use_cases/gym/get_gyms.js'
import { UpdateGym } from '../application/use_cases/gym/update_gym.js'
import { CreateGymDto, UpdateGymDto, GymResponseDto, GymListDto } from '../dto/gym.dto.js'

export default class GymsController {
  constructor(
    private createGymUseCase: CreateGym,
    private getGymByIdUseCase: GetGymById,
    private getGymsUseCase: GetGyms,
    private updateGymUseCase: UpdateGym
  ) {}

  async index({ request, response }: HttpContext) {
    try {
      const page = Number(request.input('page', 1))
      const limit = Number(request.input('limit', 10))
      const status = request.input('status')
      const ownerId = request.input('ownerId')

      const result = await this.getGymsUseCase.execute({
        filters: { status, ownerId },
        pagination: { page, limit },
      })

      const gymListDto: GymListDto = {
        gyms: result.gyms.map((gym) => this.mapToGymResponse(gym)),
        total: result.total,
        page: result.page,
        limit: result.limit,
      }

      return response.json(gymListDto)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const gym = await this.getGymByIdUseCase.execute(params.id)
      return response.json(this.mapToGymResponse(gym))
    } catch (error) {
      return response.status(404).json({ error: error.message })
    }
  }

  async create({ request, response, auth }: HttpContext) {
    try {
      if (!auth) {
        return response.status(401).json({ error: 'Authentication required' })
      }
      const data = request.body() as CreateGymDto
      const ownerId = auth.getUserId()

      const gym = await this.createGymUseCase.execute({ ...data, ownerId })
      return response.status(201).json(this.mapToGymResponse(gym))
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async update({ params, request, response, auth }: HttpContext) {
    try {
      if (!auth) {
        return response.status(401).json({ error: 'Authentication required' })
      }
      const data = request.body() as UpdateGymDto
      const userId = auth.getUserId()

      const gym = await this.updateGymUseCase.execute({
        gymId: params.id,
        userId,
        ...data,
      })
      return response.json(this.mapToGymResponse(gym))
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
}
