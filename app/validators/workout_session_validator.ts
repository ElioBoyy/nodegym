import vine from '@vinejs/vine'

export const createWorkoutSessionValidator = vine.compile(
  vine.object({
    duration: vine.number().min(1).max(1440),
    caloriesBurned: vine.number().min(0).max(10000),
    exercisesCompleted: vine
      .array(vine.string().minLength(1).maxLength(50))
      .minLength(1)
      .maxLength(20),
    notes: vine.string().maxLength(500).optional(),
    date: vine.date().optional(),
  })
)

export const updateWorkoutSessionValidator = vine.compile(
  vine.object({
    duration: vine.number().min(1).max(1440).optional(),
    caloriesBurned: vine.number().min(0).max(10000).optional(),
    exercisesCompleted: vine
      .array(vine.string().minLength(1).maxLength(50))
      .minLength(1)
      .maxLength(20)
      .optional(),
    notes: vine.string().maxLength(500).optional(),
    date: vine.date().optional(),
  })
)
