import { Gym } from '../../../domain/entities/gym.js'
import { GymRepository } from '../../../domain/repositories/gym_repository.js'

export class GetGymById {
  constructor(private gymRepository: GymRepository) {}

  async execute(id: string): Promise<Gym> {
    const gym = await this.gymRepository.findById(id)
    if (!gym) {
      throw new Error('Gym not found')
    }

    return gym
  }
}
