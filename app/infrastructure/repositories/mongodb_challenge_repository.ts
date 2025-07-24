import { Collection } from 'mongodb'
import {
  Challenge,
  ChallengeStatus,
  ChallengeDifficulty,
  ChallengeProps,
} from '../../domain/entities/challenge.js'
import {
  ChallengeRepository,
  ChallengeFilters,
} from '../../domain/repositories/challenge_repository.js'
import { PaginationOptions } from '../../domain/repositories/user_repository.js'
import { MongoDBConnection } from '../database/mongodb_connection.js'

interface ChallengeDocument {
  _id: string
  title: string
  description: string
  objectives: string[]
  exerciseTypes: string[]
  duration: number
  difficulty: ChallengeDifficulty
  creatorId: string
  gymId?: string
  status: ChallengeStatus
  maxParticipants?: number
  createdAt: Date
  updatedAt: Date
}

export class MongoDBChallengeRepository implements ChallengeRepository {
  private collection: Collection<ChallengeDocument>

  constructor() {
    const db = MongoDBConnection.getInstance().getDb()
    this.collection = db.collection<ChallengeDocument>('challenges')
  }

  async create(challenge: Challenge): Promise<Challenge> {
    const document: ChallengeDocument = {
      _id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      objectives: challenge.objectives,
      exerciseTypes: challenge.exerciseTypes,
      duration: challenge.duration,
      difficulty: challenge.difficulty,
      creatorId: challenge.creatorId,
      gymId: challenge.gymId,
      status: challenge.status,
      maxParticipants: challenge.maxParticipants,
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt,
    }

    await this.collection.insertOne(document)
    return challenge
  }

  async findById(id: string): Promise<Challenge | null> {
    const document = await this.collection.findOne({ _id: id })
    return document ? this.mapToEntity(document) : null
  }

  async findAll(
    filters?: ChallengeFilters,
    pagination?: PaginationOptions
  ): Promise<{ challenges: Challenge[]; total: number }> {
    const query = this.buildQuery(filters)

    const total = await this.collection.countDocuments(query)

    let cursor = this.collection.find(query)

    if (pagination) {
      const skip = (pagination.page - 1) * pagination.limit
      cursor = cursor.skip(skip).limit(pagination.limit)
    }

    const documents = await cursor.toArray()
    const challenges = documents.map((doc) => this.mapToEntity(doc))

    return { challenges, total }
  }

  async findByCreatorId(
    creatorId: string,
    pagination?: PaginationOptions
  ): Promise<{ challenges: Challenge[]; total: number }> {
    return this.findAll({ creatorId }, pagination)
  }

  async findByGymId(
    gymId: string,
    pagination?: PaginationOptions
  ): Promise<{ challenges: Challenge[]; total: number }> {
    return this.findAll({ gymId }, pagination)
  }

  async update(challenge: Challenge): Promise<Challenge> {
    const document: ChallengeDocument = {
      _id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      objectives: challenge.objectives,
      exerciseTypes: challenge.exerciseTypes,
      duration: challenge.duration,
      difficulty: challenge.difficulty,
      creatorId: challenge.creatorId,
      gymId: challenge.gymId,
      status: challenge.status,
      maxParticipants: challenge.maxParticipants,
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt,
    }

    await this.collection.replaceOne({ _id: challenge.id }, document)
    return challenge
  }

  async delete(id: string): Promise<void> {
    await this.collection.deleteOne({ _id: id })
  }

  async countByStatus(status: ChallengeStatus): Promise<number> {
    return await this.collection.countDocuments({ status })
  }

  async countByCreatorId(creatorId: string): Promise<number> {
    return await this.collection.countDocuments({ creatorId })
  }

  async countByGymId(gymId: string): Promise<number> {
    return await this.collection.countDocuments({ gymId })
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.collection.countDocuments({ _id: id })
    return count > 0
  }

  private buildQuery(filters?: ChallengeFilters): any {
    const query: any = {}

    if (filters?.status) {
      query.status = filters.status
    }

    if (filters?.difficulty) {
      query.difficulty = filters.difficulty
    }

    if (filters?.creatorId) {
      query.creatorId = filters.creatorId
    }

    if (filters?.gymId) {
      query.gymId = filters.gymId
    }

    return query
  }

  private mapToEntity(document: ChallengeDocument): Challenge {
    return new Challenge({
      id: document._id,
      title: document.title,
      description: document.description,
      objectives: document.objectives,
      exerciseTypes: document.exerciseTypes,
      duration: document.duration,
      difficulty: document.difficulty,
      creatorId: document.creatorId,
      gymId: document.gymId,
      status: document.status,
      maxParticipants: document.maxParticipants,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    })
  }
}
