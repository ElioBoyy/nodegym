import { User } from '../../../domain/entities/user.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'

export class ActivateUser {
  constructor(private userRepository: UserRepository) {}

  async execute(id: string, activatedBy: string): Promise<User> {
    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new Error('User not found')
    }

    if (user.isActive) {
      return user
    }

    const activatedUser = user.activate(activatedBy)
    return await this.userRepository.update(activatedUser)
  }
}
