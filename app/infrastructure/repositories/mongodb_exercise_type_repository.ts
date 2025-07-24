import { Collection } from 'mongodb'
import { ExerciseType, ExerciseDifficulty } from '../../domain/entities/exercise_type.js'
import {
  ExerciseTypeRepository,
  ExerciseTypeFilters,
} from '../../domain/repositories/exercise_type_repository.js'
import { PaginationOptions } from '../../domain/repositories/user_repository.js'
import { MongoDBConnection } from '../database/mongodb_connection.js'

interface ExerciseTypeDocument {
  _id: string
  name: string
  description: string
  targetMuscles: string[]
  difficulty: ExerciseDifficulty
  createdAt: Date
  updatedAt: Date
}

export class MongoDBExerciseTypeRepository implements ExerciseTypeRepository {
  private collection: Collection<ExerciseTypeDocument>

  constructor() {
    const db = MongoDBConnection.getInstance().getDb()
    this.collection = db.collection<ExerciseTypeDocument>('exercise_types')
  }

  async create(exerciseType: ExerciseType): Promise<ExerciseType> {
    const document: ExerciseTypeDocument = {
      _id: exerciseType.id,
      name: exerciseType.name,
      description: exerciseType.description,
      targetMuscles: exerciseType.targetMuscles,
      difficulty: exerciseType.difficulty,
      createdAt: exerciseType.createdAt,
      updatedAt: exerciseType.updatedAt,
    }

    await this.collection.insertOne(document)
    return exerciseType
  }

  async findById(id: string): Promise<ExerciseType | null> {
    const document = await this.collection.findOne({ _id: id })
    return document ? this.mapToEntity(document) : null
  }

  async findAll(
    filters?: ExerciseTypeFilters,
    pagination?: PaginationOptions
  ): Promise<{ exerciseTypes: ExerciseType[]; total: number }> {
    const query = this.buildQuery(filters)

    const total = await this.collection.countDocuments(query)

    let cursor = this.collection.find(query)

    if (pagination) {
      const skip = (pagination.page - 1) * pagination.limit
      cursor = cursor.skip(skip).limit(pagination.limit)
    }

    const documents = await cursor.toArray()
    const exerciseTypes = documents.map((doc) => this.mapToEntity(doc))

    return { exerciseTypes, total }
  }

  async findByDifficulty(difficulty: ExerciseDifficulty): Promise<ExerciseType[]> {
    const documents = await this.collection.find({ difficulty }).toArray()
    return documents.map((doc) => this.mapToEntity(doc))
  }

  async findByTargetMuscle(muscle: string): Promise<ExerciseType[]> {
    const documents = await this.collection.find({ targetMuscles: muscle }).toArray()
    return documents.map((doc) => this.mapToEntity(doc))
  }

  async update(exerciseType: ExerciseType): Promise<ExerciseType> {
    const document: ExerciseTypeDocument = {
      _id: exerciseType.id,
      name: exerciseType.name,
      description: exerciseType.description,
      targetMuscles: exerciseType.targetMuscles,
      difficulty: exerciseType.difficulty,
      createdAt: exerciseType.createdAt,
      updatedAt: exerciseType.updatedAt,
    }

    await this.collection.replaceOne({ _id: exerciseType.id }, document)
    return exerciseType
  }

  async delete(id: string): Promise<void> {
    await this.collection.deleteOne({ _id: id })
  }

  async countByDifficulty(difficulty: ExerciseDifficulty): Promise<number> {
    return await this.collection.countDocuments({ difficulty })
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.collection.countDocuments({ _id: id })
    return count > 0
  }

  private buildQuery(filters?: ExerciseTypeFilters): any {
    const query: any = {}

    if (filters?.difficulty) {
      query.difficulty = filters.difficulty
    }

    if (filters?.targetMuscle) {
      query.targetMuscles = filters.targetMuscle
    }

    return query
  }

  private mapToEntity(document: ExerciseTypeDocument): ExerciseType {
    return new ExerciseType({
      id: document._id,
      name: document.name,
      description: document.description,
      targetMuscles: document.targetMuscles,
      difficulty: document.difficulty,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    })
  }
}
