import { Specification } from './specification.js'
import { Challenge, ChallengeStatus } from '../entities/challenge.js'

export class ChallengeIsActiveSpecification extends Specification<Challenge> {
  isSatisfiedBy(challenge: Challenge): boolean {
    return challenge.status === ChallengeStatus.ACTIVE
  }
}

export class ChallengeHasCapacitySpecification extends Specification<Challenge> {
  constructor(private currentParticipants: number) {
    super()
  }

  isSatisfiedBy(challenge: Challenge): boolean {
    return this.currentParticipants < challenge.maxParticipants
  }
}

export class ChallengeIsWithinDateRangeSpecification extends Specification<Challenge> {
  constructor(private currentDate: Date = new Date()) {
    super()
  }

  isSatisfiedBy(challenge: Challenge): boolean {
    return challenge.startDate <= this.currentDate && challenge.endDate >= this.currentDate
  }
}

export class UserCanJoinChallengeSpecification extends Specification<Challenge> {
  constructor(
    private currentParticipants: number,
    private currentDate: Date = new Date()
  ) {
    super()
  }

  isSatisfiedBy(challenge: Challenge): boolean {
    const isActive = new ChallengeIsActiveSpecification()
    const hasCapacity = new ChallengeHasCapacitySpecification(this.currentParticipants)
    const isWithinDateRange = new ChallengeIsWithinDateRangeSpecification(this.currentDate)

    return isActive.and(hasCapacity).and(isWithinDateRange).isSatisfiedBy(challenge)
  }
}
