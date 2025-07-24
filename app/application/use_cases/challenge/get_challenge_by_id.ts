import { Challenge } from '../../../domain/entities/challenge.js'
import { ChallengeRepository } from '../../../domain/repositories/challenge_repository.js'

export class GetChallengeById {
  constructor(private challengeRepository: ChallengeRepository) {}

  async execute(id: string): Promise<Challenge> {
    const challenge = await this.challengeRepository.findById(id)
    if (!challenge) {
      throw new Error('Challenge not found')
    }

    return challenge
  }
}
