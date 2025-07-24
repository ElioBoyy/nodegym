import vine from '@vinejs/vine'
import { UserRole } from '../domain/entities/user.js'

export const createUserValidator = vine.compile(
  vine.object({
    email: vine.string().email().toLowerCase(),
    firstName: vine.string().minLength(2).maxLength(100).toCamelCase(),
    lastName: vine.string().minLength(2).maxLength(100).toCamelCase(),
    password: vine.string().minLength(8).maxLength(100),
    role: vine.enum(Object.values(UserRole)),
  })
)

export const authUserValidator = vine.compile(
  vine.object({
    email: vine.string().email().toLowerCase(),
    password: vine.string().minLength(1).maxLength(100),
  })
)

export const updateUserValidator = vine.compile(
  vine.object({
    email: vine.string().email().toLowerCase().optional(),
    firstName: vine.string().minLength(2).maxLength(100).toCamelCase().optional(),
    lastName: vine.string().minLength(2).maxLength(100).toCamelCase().optional(),
    password: vine.string().minLength(8).maxLength(100).optional(),
  })
)
