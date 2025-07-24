import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class ForceJsonResponseMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    ctx.response.header('Content-Type', 'application/json')
    await next()
  }
}
