import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { GymStatus } from '../domain/entities/gym.js'

export default class Gym extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare address: string

  @column()
  declare contact: string

  @column()
  declare description: string

  @column()
  declare capacity: number

  @column()
  declare equipment: string[]

  @column()
  declare activities: string[]

  @column()
  declare ownerId: string

  @column()
  declare status: GymStatus

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  static table = 'gyms'
}
