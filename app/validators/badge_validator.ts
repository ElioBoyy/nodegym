import vine from '@vinejs/vine'
import { BadgeRuleType } from '../domain/entities/badge.js'

const badgeRuleValidator = vine.object({
  type: vine.enum(Object.values(BadgeRuleType)),
  condition: vine.string().minLength(1).maxLength(100),
  value: vine.number().min(1).max(100000),
})

export const createBadgeValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(50),
    description: vine.string().minLength(10).maxLength(200),
    iconUrl: vine.string().url().maxLength(500),
    rules: vine.array(badgeRuleValidator).minLength(1).maxLength(10),
  })
)

export const updateBadgeValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(50).optional(),
    description: vine.string().minLength(10).maxLength(200).optional(),
    iconUrl: vine.string().url().maxLength(500).optional(),
    rules: vine.array(badgeRuleValidator).minLength(1).maxLength(10).optional(),
  })
)
