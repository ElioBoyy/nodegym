import { Collection } from 'mongodb'
import { Badge, BadgeRule } from '../../domain/entities/badge.js'
import { BadgeRepository, BadgeFilters } from '../../domain/repositories/badge_repository.js'
import { PaginationOptions } from '../../domain/repositories/user_repository.js'
import { MongoDBConnection } from '../database/mongodb_connection.js'

interface BadgeDocument {
  _id: string
  name: string
  description: string
  iconUrl: string
  rules: BadgeRule[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export class MongoDBBadgeRepository implements BadgeRepository {
  private collection: Collection<BadgeDocument>

  constructor() {
    const db = MongoDBConnection.getInstance().getDb()
    this.collection = db.collection<BadgeDocument>('badges')
  }

  async create(badge: Badge): Promise<Badge> {
    const document: BadgeDocument = {
      _id: badge.id,
      name: badge.name,
      description: badge.description,
      iconUrl: badge.iconUrl,
      rules: badge.rules,
      isActive: badge.isActive,
      createdAt: badge.createdAt,
      updatedAt: badge.updatedAt,
    }

    await this.collection.insertOne(document)
    return badge
  }

  async findById(id: string): Promise<Badge | null> {
    const document = await this.collection.findOne({ _id: id })
    return document ? this.mapToEntity(document) : null
  }

  async findAll(
    filters?: BadgeFilters,
    pagination?: PaginationOptions
  ): Promise<{ badges: Badge[]; total: number }> {
    const query = this.buildQuery(filters)

    const total = await this.collection.countDocuments(query)

    let cursor = this.collection.find(query)

    if (pagination) {
      const skip = (pagination.page - 1) * pagination.limit
      cursor = cursor.skip(skip).limit(pagination.limit)
    }

    const documents = await cursor.toArray()
    const badges = documents.map((doc) => this.mapToEntity(doc))

    return { badges, total }
  }

  async findActive(): Promise<Badge[]> {
    const documents = await this.collection.find({ isActive: true }).toArray()
    return documents.map((doc) => this.mapToEntity(doc))
  }

  async update(badge: Badge): Promise<Badge> {
    const document: BadgeDocument = {
      _id: badge.id,
      name: badge.name,
      description: badge.description,
      iconUrl: badge.iconUrl,
      rules: badge.rules,
      isActive: badge.isActive,
      createdAt: badge.createdAt,
      updatedAt: badge.updatedAt,
    }

    await this.collection.replaceOne({ _id: badge.id }, document)
    return badge
  }

  async delete(id: string): Promise<void> {
    await this.collection.deleteOne({ _id: id })
  }

  async countActive(): Promise<number> {
    return await this.collection.countDocuments({ isActive: true })
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.collection.countDocuments({ _id: id })
    return count > 0
  }

  private buildQuery(filters?: BadgeFilters): any {
    const query: any = {}

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive
    }

    return query
  }

  private mapToEntity(document: BadgeDocument): Badge {
    return new Badge({
      id: document._id,
      name: document.name,
      description: document.description,
      iconUrl: document.iconUrl,
      rules: document.rules,
      isActive: document.isActive,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    })
  }
}
