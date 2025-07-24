import { Gym, GymStatus } from '../entities/gym.js'
import { PaginationOptions } from './user_repository.js'

export interface GymFilters {
  status?: GymStatus
  ownerId?: string
}

export interface GymRepository {
  create(gym: Gym): Promise<Gym>
  findById(id: string): Promise<Gym | null>
  findByOwnerId(ownerId: string): Promise<Gym | null>
  findAll(
    filters?: GymFilters,
    pagination?: PaginationOptions
  ): Promise<{ gyms: Gym[]; total: number }>
  update(gym: Gym): Promise<Gym>
  delete(id: string): Promise<void>
  countByStatus(status: GymStatus): Promise<number>
  exists(id: string): Promise<boolean>
  findPending(pagination?: PaginationOptions): Promise<{ gyms: Gym[]; total: number }>
}
