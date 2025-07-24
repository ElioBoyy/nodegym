import vine from '@vinejs/vine'
import { ExerciseDifficulty } from '../domain/entities/exercise_type.js'

export const createExerciseTypeValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(50),
    description: vine.string().minLength(10).maxLength(300),
    targetMuscles: vine.array(vine.string().minLength(2).maxLength(30)).minLength(1).maxLength(10),
    difficulty: vine.enum(Object.values(ExerciseDifficulty)),
  })
)

export const updateExerciseTypeValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(50).optional(),
    description: vine.string().minLength(10).maxLength(300).optional(),
    targetMuscles: vine
      .array(vine.string().minLength(2).maxLength(30))
      .minLength(1)
      .maxLength(10)
      .optional(),
    difficulty: vine.enum(Object.values(ExerciseDifficulty)).optional(),
  })
)
