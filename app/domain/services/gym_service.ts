import { Gym, GymStatus } from '../entities/gym.js'
import { User } from '../entities/user.js'

export interface GymService {
  canUserCreateGym(user: User): boolean
  canUserManageGym(user: User, gym: Gym): boolean
  isEligibleForApproval(gym: Gym): boolean
  calculateCapacityUtilization(gym: Gym, currentMembers: number): number
}

export class DomainGymService implements GymService {
  canUserCreateGym(user: User): boolean {
    return user.isActive && user.role === 'gym_owner'
  }

  canUserManageGym(user: User, gym: Gym): boolean {
    if (user.role === 'super_admin') {
      return true
    }

    if (user.role === 'gym_owner' && gym.ownerId === user.id) {
      return true
    }

    return false
  }

  isEligibleForApproval(gym: Gym): boolean {
    if (gym.status !== GymStatus.PENDING) {
      return false
    }

    return (
      gym.name.length >= 3 &&
      gym.address.length >= 10 &&
      gym.contact.length >= 5 &&
      gym.capacity > 0
    )
  }

  calculateCapacityUtilization(gym: Gym, currentMembers: number): number {
    if (gym.capacity === 0) {
      return 0
    }

    return Math.min((currentMembers / gym.capacity) * 100, 100)
  }
}
