import { Specification } from './specification.js'
import { User, UserRole } from '../entities/user.js'

export class UserIsActiveSpecification extends Specification<User> {
  isSatisfiedBy(user: User): boolean {
    return user.isActive
  }
}

export class UserHasRoleSpecification extends Specification<User> {
  constructor(private role: UserRole) {
    super()
  }

  isSatisfiedBy(user: User): boolean {
    return user.role === this.role
  }
}

export class UserCanManageGymSpecification extends Specification<User> {
  isSatisfiedBy(user: User): boolean {
    return user.role === UserRole.GYM_OWNER || user.role === UserRole.SUPER_ADMIN
  }
}

export class UserCanCreateChallengeSpecification extends Specification<User> {
  isSatisfiedBy(user: User): boolean {
    return user.isActive && (user.role === UserRole.GYM_OWNER || user.role === UserRole.SUPER_ADMIN)
  }
}

export class UserCanJoinChallengeSpecification extends Specification<User> {
  isSatisfiedBy(user: User): boolean {
    return user.isActive && user.role === UserRole.CLIENT
  }
}
