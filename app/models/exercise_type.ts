import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { ExerciseDifficulty } from '../domain/entities/exercise_type.js'

export default class ExerciseType extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare targetMuscles: string[]

  @column()
  declare difficulty: ExerciseDifficulty

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  static table = 'exercise_types'
}
