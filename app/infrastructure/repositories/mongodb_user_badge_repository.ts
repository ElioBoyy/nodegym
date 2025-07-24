import { Collection } from 'mongodb'
import { UserBadge } from '../../domain/entities/user_badge.js'
import {
  UserBadgeRepository,
  UserBadgeFilters,
} from '../../domain/repositories/user_badge_repository.js'
import { PaginationOptions } from '../../domain/repositories/user_repository.js'
import { MongoDBConnection } from '../database/mongodb_connection.js'

interface UserBadgeDocument {
  _id: string
  userId: string
  badgeId: string
  earnedAt: Date
  relatedChallengeId?: string
  metadata?: Record<string, any>
}

export class MongoDBUserBadgeRepository implements UserBadgeRepository {
  private collection: Collection<UserBadgeDocument>

  constructor() {
    const db = MongoDBConnection.getInstance().getDb()
    this.collection = db.collection<UserBadgeDocument>('user_badges')
  }

  async create(userBadge: UserBadge): Promise<UserBadge> {
    const document: UserBadgeDocument = {
      _id: userBadge.id,
      userId: userBadge.userId,
      badgeId: userBadge.badgeId,
      earnedAt: userBadge.earnedAt,
      relatedChallengeId: userBadge.relatedChallengeId,
      metadata: userBadge.metadata,
    }

    await this.collection.insertOne(document)
    return userBadge
  }

  async findById(id: string): Promise<UserBadge | null> {
    const document = await this.collection.findOne({ _id: id })
    return document ? this.mapToEntity(document) : null
  }

  async findByUserAndBadge(userId: string, badgeId: string): Promise<UserBadge | null> {
    const document = await this.collection.findOne({ userId, badgeId })
    return document ? this.mapToEntity(document) : null
  }

  async findAll(
    filters?: UserBadgeFilters,
    pagination?: PaginationOptions
  ): Promise<{ userBadges: UserBadge[]; total: number }> {
    const query = this.buildQuery(filters)

    const total = await this.collection.countDocuments(query)

    let cursor = this.collection.find(query)

    if (pagination) {
      const skip = (pagination.page - 1) * pagination.limit
      cursor = cursor.skip(skip).limit(pagination.limit)
    }

    const documents = await cursor.toArray()
    const userBadges = documents.map((doc) => this.mapToEntity(doc))

    return { userBadges, total }
  }

  async findByUserId(
    userId: string,
    pagination?: PaginationOptions
  ): Promise<{ userBadges: UserBadge[]; total: number }> {
    return this.findAll({ userId }, pagination)
  }

  async findByBadgeId(
    badgeId: string,
    pagination?: PaginationOptions
  ): Promise<{ userBadges: UserBadge[]; total: number }> {
    return this.findAll({ badgeId }, pagination)
  }

  async delete(id: string): Promise<void> {
    await this.collection.deleteOne({ _id: id })
  }

  async countByUserId(userId: string): Promise<number> {
    return await this.collection.countDocuments({ userId })
  }

  async countByBadgeId(badgeId: string): Promise<number> {
    return await this.collection.countDocuments({ badgeId })
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.collection.countDocuments({ _id: id })
    return count > 0
  }

  async existsByUserAndBadge(userId: string, badgeId: string): Promise<boolean> {
    const count = await this.collection.countDocuments({ userId, badgeId })
    return count > 0
  }

  private buildQuery(filters?: UserBadgeFilters): any {
    const query: any = {}

    if (filters?.userId) {
      query.userId = filters.userId
    }

    if (filters?.badgeId) {
      query.badgeId = filters.badgeId
    }

    if (filters?.relatedChallengeId) {
      query.relatedChallengeId = filters.relatedChallengeId
    }

    return query
  }

  private mapToEntity(document: UserBadgeDocument): UserBadge {
    return new UserBadge({
      id: document._id,
      userId: document.userId,
      badgeId: document.badgeId,
      earnedAt: document.earnedAt,
      relatedChallengeId: document.relatedChallengeId,
      metadata: document.metadata,
    })
  }
}
