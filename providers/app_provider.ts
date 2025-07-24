import type { ApplicationService } from '@adonisjs/core/types'
import { ArchitectureBootstrap } from '../app/application/integration/architecture_bootstrap.js'

export default class AppProvider {
  constructor(protected app: ApplicationService) {}

  register() {}

  async boot() {
    const { container, mediator, eventDispatcher } = await ArchitectureBootstrap.initialize()

    this.app.container.singleton('DIContainer', () => container)
    this.app.container.singleton('CQRSMediator', () => mediator)
    this.app.container.singleton('DomainEventDispatcher', () => eventDispatcher)
  }

  async start() {}

  async ready() {}

  async shutdown() {}
}
