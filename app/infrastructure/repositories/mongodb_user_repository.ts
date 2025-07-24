import { Collection } from 'mongodb'
import { User, UserRole } from '../../domain/entities/user.js'
import {
  UserRepository,
  UserFilters,
  PaginationOptions,
} from '../../domain/repositories/user_repository.js'
import { MongoDBConnection } from '../database/mongodb_connection.js'

interface UserDocument {
  _id: string
  email: string
  firstName: string
  lastName: string
  password: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export class MongoDBUserRepository implements UserRepository {
  private collection: Collection<UserDocument>

  constructor() {
    const db = MongoDBConnection.getInstance().getDb()
    this.collection = db.collection<UserDocument>('users')
  }

  async create(user: User): Promise<User> {
    const document: UserDocument = {
      _id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      password: user.password,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    await this.collection.insertOne(document)
    return user
  }

  async findById(id: string): Promise<User | null> {
    const document = await this.collection.findOne({ _id: id })
    return document ? this.mapToEntity(document) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const document = await this.collection.findOne({ email })
    return document ? this.mapToEntity(document) : null
  }

  async findAll(
    filters?: UserFilters,
    pagination?: PaginationOptions
  ): Promise<{ users: User[]; total: number }> {
    const query = this.buildQuery(filters)

    const total = await this.collection.countDocuments(query)

    let cursor = this.collection.find(query)

    if (pagination) {
      const skip = (pagination.page - 1) * pagination.limit
      cursor = cursor.skip(skip).limit(pagination.limit)
    }

    const documents = await cursor.toArray()
    const users = documents.map((doc) => this.mapToEntity(doc))

    return { users, total }
  }

  async update(user: User): Promise<User> {
    const document: UserDocument = {
      _id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      password: user.password,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    await this.collection.replaceOne({ _id: user.id }, document)
    return user
  }

  async delete(id: string): Promise<void> {
    await this.collection.deleteOne({ _id: id })
  }

  async countByRole(role: UserRole): Promise<number> {
    return await this.collection.countDocuments({ role })
  }

  async countActive(): Promise<number> {
    return await this.collection.countDocuments({ isActive: true })
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.collection.countDocuments({ _id: id })
    return count > 0
  }

  private buildQuery(filters?: UserFilters): any {
    const query: any = {}

    if (filters?.role) {
      query.role = filters.role
    }

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive
    }

    if (filters?.email) {
      query.email = { $regex: filters.email, $options: 'i' }
    }

    return query
  }

  private mapToEntity(document: UserDocument): User {
    return new User({
      id: document._id,
      email: document.email,
      firstName: document.firstName,
      lastName: document.lastName,
      password: document.password,
      role: document.role,
      isActive: document.isActive,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    })
  }
}
