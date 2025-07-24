import { Gym } from '../../../domain/entities/gym.js'
import { GymRepository } from '../../../domain/repositories/gym_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'

export interface UpdateGymRequest {
  gymId: string
  userId: string
  name?: string
  address?: string
  contact?: string
  description?: string
  capacity?: number
  equipment?: string[]
  activities?: string[]
}

export class UpdateGym {
  constructor(
    private gymRepository: GymRepository,
    private userRepository: UserRepository
  ) {}

  async execute(request: UpdateGymRequest): Promise<Gym> {
    const user = await this.userRepository.findById(request.userId)
    if (!user) {
      throw new Error('User not found')
    }

    const gym = await this.gymRepository.findById(request.gymId)
    if (!gym) {
      throw new Error('Gym not found')
    }

    if (!user.isSuperAdmin() && !gym.belongsTo(request.userId)) {
      throw new Error('Unauthorized: Can only update own gym')
    }

    const updatedGym = gym.update({
      name: request.name,
      address: request.address,
      contact: request.contact,
      description: request.description,
      capacity: request.capacity,
      equipment: request.equipment,
      activities: request.activities,
    })

    return await this.gymRepository.update(updatedGym)
  }
}
