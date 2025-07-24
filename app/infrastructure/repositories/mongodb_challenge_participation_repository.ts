import { Collection } from 'mongodb'
import {
  ChallengeParticipation,
  ParticipationStatus,
  WorkoutSession,
} from '../../domain/entities/challenge_participation.js'
import {
  ChallengeParticipationRepository,
  ParticipationFilters,
} from '../../domain/repositories/challenge_participation_repository.js'
import { PaginationOptions } from '../../domain/repositories/user_repository.js'
import { MongoDBConnection } from '../database/mongodb_connection.js'

interface ParticipationDocument {
  _id: string
  challengeId: string
  userId: string
  status: ParticipationStatus
  progress: number
  workoutSessions: WorkoutSession[]
  joinedAt: Date
  completedAt?: Date
  updatedAt: Date
}

export class MongoDBChallengeParticipationRepository implements ChallengeParticipationRepository {
  private collection: Collection<ParticipationDocument>

  constructor() {
    const db = MongoDBConnection.getInstance().getDb()
    this.collection = db.collection<ParticipationDocument>('challenge_participations')
  }

  async create(participation: ChallengeParticipation): Promise<ChallengeParticipation> {
    const document: ParticipationDocument = {
      _id: participation.id,
      challengeId: participation.challengeId,
      userId: participation.userId,
      status: participation.status,
      progress: participation.progress,
      workoutSessions: participation.workoutSessions,
      joinedAt: participation.joinedAt,
      completedAt: participation.completedAt,
      updatedAt: participation.updatedAt,
    }

    await this.collection.insertOne(document)
    return participation
  }

  async findById(id: string): Promise<ChallengeParticipation | null> {
    const document = await this.collection.findOne({ _id: id })
    return document ? this.mapToEntity(document) : null
  }

  async findByUserAndChallenge(
    userId: string,
    challengeId: string
  ): Promise<ChallengeParticipation | null> {
    const document = await this.collection.findOne({ userId, challengeId })
    return document ? this.mapToEntity(document) : null
  }

  async findAll(
    filters?: ParticipationFilters,
    pagination?: PaginationOptions
  ): Promise<{ participations: ChallengeParticipation[]; total: number }> {
    const query = this.buildQuery(filters)

    const total = await this.collection.countDocuments(query)

    let cursor = this.collection.find(query)

    if (pagination) {
      const skip = (pagination.page - 1) * pagination.limit
      cursor = cursor.skip(skip).limit(pagination.limit)
    }

    const documents = await cursor.toArray()
    const participations = documents.map((doc) => this.mapToEntity(doc))

    return { participations, total }
  }

  async findByUserId(
    userId: string,
    pagination?: PaginationOptions
  ): Promise<{ participations: ChallengeParticipation[]; total: number }> {
    return this.findAll({ userId }, pagination)
  }

  async findByChallengeId(
    challengeId: string,
    pagination?: PaginationOptions
  ): Promise<{ participations: ChallengeParticipation[]; total: number }> {
    return this.findAll({ challengeId }, pagination)
  }

  async update(participation: ChallengeParticipation): Promise<ChallengeParticipation> {
    const document: ParticipationDocument = {
      _id: participation.id,
      challengeId: participation.challengeId,
      userId: participation.userId,
      status: participation.status,
      progress: participation.progress,
      workoutSessions: participation.workoutSessions,
      joinedAt: participation.joinedAt,
      completedAt: participation.completedAt,
      updatedAt: participation.updatedAt,
    }

    await this.collection.replaceOne({ _id: participation.id }, document)
    return participation
  }

  async delete(id: string): Promise<void> {
    await this.collection.deleteOne({ _id: id })
  }

  async countByChallengeId(challengeId: string): Promise<number> {
    return await this.collection.countDocuments({ challengeId })
  }

  async countByUserId(userId: string): Promise<number> {
    return await this.collection.countDocuments({ userId })
  }

  async countByStatus(status: ParticipationStatus): Promise<number> {
    return await this.collection.countDocuments({ status })
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.collection.countDocuments({ _id: id })
    return count > 0
  }

  async existsByUserAndChallenge(userId: string, challengeId: string): Promise<boolean> {
    const count = await this.collection.countDocuments({ userId, challengeId })
    return count > 0
  }

  private buildQuery(filters?: ParticipationFilters): any {
    const query: any = {}

    if (filters?.status) {
      query.status = filters.status
    }

    if (filters?.userId) {
      query.userId = filters.userId
    }

    if (filters?.challengeId) {
      query.challengeId = filters.challengeId
    }

    return query
  }

  private mapToEntity(document: ParticipationDocument): ChallengeParticipation {
    return new ChallengeParticipation({
      id: document._id,
      challengeId: document.challengeId,
      userId: document.userId,
      status: document.status,
      progress: document.progress,
      workoutSessions: document.workoutSessions,
      joinedAt: document.joinedAt,
      completedAt: document.completedAt,
      updatedAt: document.updatedAt,
    })
  }
}
