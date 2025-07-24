import { Gym } from '../../../domain/entities/gym.js'
import { GymRepository } from '../../../domain/repositories/gym_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { NotificationService } from '../../../domain/services/notification_service.js'

export interface ApproveGymRequest {
  gymId: string
  adminId: string
  approved: boolean
}

export class ApproveGym {
  constructor(
    private gymRepository: GymRepository,
    private userRepository: UserRepository,
    private notificationService: NotificationService
  ) {}

  async execute(request: ApproveGymRequest): Promise<Gym> {
    const admin = await this.userRepository.findById(request.adminId)
    if (!admin || !admin.isSuperAdmin()) {
      throw new Error('Unauthorized: Only super admins can approve gyms')
    }

    const gym = await this.gymRepository.findById(request.gymId)
    if (!gym) {
      throw new Error('Gym not found')
    }

    if (!gym.isPending()) {
      throw new Error('Gym is not pending approval')
    }

    const updatedGym = request.approved ? gym.approve() : gym.reject()
    const result = await this.gymRepository.update(updatedGym)

    if (request.approved) {
      await this.notificationService.sendGymApproved(gym.ownerId, gym.name, gym.id)
    }

    return result
  }
}
