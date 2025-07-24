import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class UserBadge extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare badgeId: string

  @column.dateTime()
  declare earnedAt: DateTime

  @column()
  declare relatedChallengeId: string | null

  @column()
  declare metadata: Record<string, any> | null

  static table = 'user_badges'
}
