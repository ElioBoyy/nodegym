import { User } from '../../../domain/entities/user.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'

export class DeactivateUser {
  constructor(private userRepository: UserRepository) {}

  async execute(id: string, deactivatedBy: string, reason?: string): Promise<User> {
    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new Error('User not found')
    }

    if (!user.isActive) {
      return user
    }

    const deactivatedUser = user.deactivate(deactivatedBy, reason)
    return await this.userRepository.update(deactivatedUser)
  }
}
