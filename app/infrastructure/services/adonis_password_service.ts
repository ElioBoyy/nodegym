import hash from '@adonisjs/core/services/hash'
import { PasswordService } from '../../domain/services/password_service.js'

export class AdonisPasswordService implements PasswordService {
  async hash(password: string): Promise<string> {
    return await hash.make(password)
  }

  async verify(hashedPassword: string, plainPassword: string): Promise<boolean> {
    return await hash.verify(hashedPassword, plainPassword)
  }
}
