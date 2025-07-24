import { Gym } from '../../../domain/entities/gym.js'
import { GymRepository } from '../../../domain/repositories/gym_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'

export interface CreateGymRequest {
  name: string
  address: string
  contact: string
  description: string
  capacity: number
  equipment: string[]
  activities: string[]
  ownerId: string
}

export class CreateGym {
  constructor(
    private gymRepository: GymRepository,
    private userRepository: UserRepository
  ) {}

  async execute(request: CreateGymRequest): Promise<Gym> {
    const owner = await this.userRepository.findById(request.ownerId)
    if (!owner) {
      throw new Error('Owner not found')
    }

    if (!owner.isGymOwner()) {
      throw new Error('Only gym owners can create gyms')
    }

    const existingGym = await this.gymRepository.findByOwnerId(request.ownerId)
    if (existingGym) {
      throw new Error('Owner already has a gym')
    }

    const gym = new Gym({
      id: crypto.randomUUID(),
      name: request.name,
      address: request.address,
      contact: request.contact,
      description: request.description,
      capacity: request.capacity,
      equipment: request.equipment,
      activities: request.activities,
      ownerId: request.ownerId,
    })

    return await this.gymRepository.create(gym)
  }
}
