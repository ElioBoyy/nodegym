import vine from '@vinejs/vine'

export const createGymValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(100),
    address: vine.string().minLength(5).maxLength(200),
    contact: vine.string().minLength(5).maxLength(100),
    description: vine.string().minLength(10).maxLength(500),
    capacity: vine.number().min(1).max(10000),
    equipment: vine.array(vine.string().minLength(1).maxLength(50)).minLength(1),
    activities: vine.array(vine.string().minLength(1).maxLength(50)).minLength(1),
  })
)

export const updateGymValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(100).optional(),
    address: vine.string().minLength(5).maxLength(200).optional(),
    contact: vine.string().minLength(5).maxLength(100).optional(),
    description: vine.string().minLength(10).maxLength(500).optional(),
    capacity: vine.number().min(1).max(10000).optional(),
    equipment: vine.array(vine.string().minLength(1).maxLength(50)).minLength(1).optional(),
    activities: vine.array(vine.string().minLength(1).maxLength(50)).minLength(1).optional(),
  })
)

export const approveGymValidator = vine.compile(
  vine.object({
    approved: vine.boolean(),
  })
)
