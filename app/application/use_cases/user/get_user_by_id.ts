import { User } from '../../../domain/entities/user.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'

export class GetUserById {
  constructor(private userRepository: UserRepository) {}

  async execute(id: string): Promise<User> {
    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new Error('User not found')
    }

    return user
  }
}
