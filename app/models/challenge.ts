import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { ChallengeStatus, ChallengeDifficulty } from '../domain/entities/challenge.js'

export default class Challenge extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare title: string

  @column()
  declare description: string

  @column()
  declare objectives: string[]

  @column()
  declare exerciseTypes: string[]

  @column()
  declare duration: number

  @column()
  declare difficulty: ChallengeDifficulty

  @column()
  declare creatorId: string

  @column()
  declare gymId: string | null

  @column()
  declare status: ChallengeStatus

  @column()
  declare maxParticipants: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  static table = 'challenges'
}
