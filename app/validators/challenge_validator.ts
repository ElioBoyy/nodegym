import vine from '@vinejs/vine'
import { ChallengeDifficulty } from '../domain/entities/challenge.js'

export const createChallengeValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(3).maxLength(100),
    description: vine.string().minLength(10).maxLength(500),
    objectives: vine.array(vine.string().minLength(3).maxLength(200)).minLength(1).maxLength(10),
    exerciseTypes: vine.array(vine.string().minLength(1).maxLength(50)).minLength(1).maxLength(20),
    duration: vine.number().min(1).max(365),
    difficulty: vine.enum(Object.values(ChallengeDifficulty)),
    gymId: vine.string().uuid().optional(),
    maxParticipants: vine.number().min(1).max(1000).optional(),
  })
)

export const updateChallengeValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(3).maxLength(100).optional(),
    description: vine.string().minLength(10).maxLength(500).optional(),
    objectives: vine
      .array(vine.string().minLength(3).maxLength(200))
      .minLength(1)
      .maxLength(10)
      .optional(),
    exerciseTypes: vine
      .array(vine.string().minLength(1).maxLength(50))
      .minLength(1)
      .maxLength(20)
      .optional(),
    duration: vine.number().min(1).max(365).optional(),
    difficulty: vine.enum(Object.values(ChallengeDifficulty)).optional(),
    maxParticipants: vine.number().min(1).max(1000).optional(),
  })
)
