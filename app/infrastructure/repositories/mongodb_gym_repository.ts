import { Collection } from 'mongodb'
import { Gym, GymStatus } from '../../domain/entities/gym.js'
import { GymRepository, GymFilters } from '../../domain/repositories/gym_repository.js'
import { PaginationOptions } from '../../domain/repositories/user_repository.js'
import { MongoDBConnection } from '../database/mongodb_connection.js'

interface GymDocument {
  _id: string
  name: string
  address: string
  contact: string
  description: string
  capacity: number
  equipment: string[]
  activities: string[]
  ownerId: string
  status: GymStatus
  createdAt: Date
  updatedAt: Date
}

export class MongoDBGymRepository implements GymRepository {
  private collection: Collection<GymDocument>

  constructor() {
    const db = MongoDBConnection.getInstance().getDb()
    this.collection = db.collection<GymDocument>('gyms')
  }

  async create(gym: Gym): Promise<Gym> {
    const document: GymDocument = {
      _id: gym.id,
      name: gym.name,
      address: gym.address,
      contact: gym.contact,
      description: gym.description,
      capacity: gym.capacity,
      equipment: gym.equipment,
      activities: gym.activities,
      ownerId: gym.ownerId,
      status: gym.status,
      createdAt: gym.createdAt,
      updatedAt: gym.updatedAt,
    }

    await this.collection.insertOne(document)
    return gym
  }

  async findById(id: string): Promise<Gym | null> {
    const document = await this.collection.findOne({ _id: id })
    return document ? this.mapToEntity(document) : null
  }

  async findByOwnerId(ownerId: string): Promise<Gym | null> {
    const document = await this.collection.findOne({ ownerId })
    return document ? this.mapToEntity(document) : null
  }

  async findAll(
    filters?: GymFilters,
    pagination?: PaginationOptions
  ): Promise<{ gyms: Gym[]; total: number }> {
    const query = this.buildQuery(filters)

    const total = await this.collection.countDocuments(query)

    let cursor = this.collection.find(query)

    if (pagination) {
      const skip = (pagination.page - 1) * pagination.limit
      cursor = cursor.skip(skip).limit(pagination.limit)
    }

    const documents = await cursor.toArray()
    const gyms = documents.map((doc) => this.mapToEntity(doc))

    return { gyms, total }
  }

  async update(gym: Gym): Promise<Gym> {
    const document: GymDocument = {
      _id: gym.id,
      name: gym.name,
      address: gym.address,
      contact: gym.contact,
      description: gym.description,
      capacity: gym.capacity,
      equipment: gym.equipment,
      activities: gym.activities,
      ownerId: gym.ownerId,
      status: gym.status,
      createdAt: gym.createdAt,
      updatedAt: gym.updatedAt,
    }

    await this.collection.replaceOne({ _id: gym.id }, document)
    return gym
  }

  async delete(id: string): Promise<void> {
    await this.collection.deleteOne({ _id: id })
  }

  async countByStatus(status: GymStatus): Promise<number> {
    return await this.collection.countDocuments({ status })
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.collection.countDocuments({ _id: id })
    return count > 0
  }

  async findPending(pagination?: PaginationOptions): Promise<{ gyms: Gym[]; total: number }> {
    return this.findAll({ status: GymStatus.PENDING }, pagination)
  }

  private buildQuery(filters?: GymFilters): any {
    const query: any = {}

    if (filters?.status) {
      query.status = filters.status
    }

    if (filters?.ownerId) {
      query.ownerId = filters.ownerId
    }

    return query
  }

  private mapToEntity(document: GymDocument): Gym {
    return new Gym({
      id: document._id,
      name: document.name,
      address: document.address,
      contact: document.contact,
      description: document.description,
      capacity: document.capacity,
      equipment: document.equipment,
      activities: document.activities,
      ownerId: document.ownerId,
      status: document.status,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    })
  }
}
