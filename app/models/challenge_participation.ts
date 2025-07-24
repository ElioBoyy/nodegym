import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { ParticipationStatus, WorkoutSession } from '../domain/entities/challenge_participation.js'

export default class ChallengeParticipation extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare challengeId: string

  @column()
  declare userId: string

  @column()
  declare status: ParticipationStatus

  @column()
  declare progress: number

  @column()
  declare workoutSessions: WorkoutSession[]

  @column.dateTime()
  declare joinedAt: DateTime

  @column.dateTime()
  declare completedAt: DateTime | null

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  static table = 'challenge_participations'
}
