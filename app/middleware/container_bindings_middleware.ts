import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { DIContainer } from '../infrastructure/dependency_injection/container.js'

export default class ContainerBindingsMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const container = DIContainer.getInstance()

    if (!container) {
      throw new Error('DIContainer not initialized')
    }

    ctx.container = container

    await next()
  }
}
