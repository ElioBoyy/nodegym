import jwt from 'jsonwebtoken'

export interface JwtPayload {
  userId: string
  email: string
  role: string
}

export class JwtService {
  private secret: string
  private expiresIn: number

  constructor() {
    this.secret = process.env.JWT_SECRET || 'your-secret-key-here'
    this.expiresIn = Number.parseInt(process.env.JWT_EXPIRES_IN || '604800') // 7 jours en secondes
  }

  generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn })
  }

  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.secret) as JwtPayload
    } catch (error) {
      throw new Error('Invalid token')
    }
  }

  decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload
    } catch (error) {
      return null
    }
  }
}
