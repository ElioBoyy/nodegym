export interface UserBadgeProps {
  id: string
  userId: string
  badgeId: string
  earnedAt?: Date
  relatedChallengeId?: string
  metadata?: Record<string, any>
}

export class UserBadge {
  public readonly id: string
  public readonly userId: string
  public readonly badgeId: string
  public readonly earnedAt: Date
  public readonly relatedChallengeId?: string
  public readonly metadata?: Record<string, any>

  constructor(props: UserBadgeProps) {
    this.id = props.id
    this.userId = props.userId
    this.badgeId = props.badgeId
    this.earnedAt = props.earnedAt ?? new Date()
    this.relatedChallengeId = props.relatedChallengeId
    this.metadata = props.metadata
  }

  isRelatedToChallenge(): boolean {
    return this.relatedChallengeId !== undefined
  }

  hasMetadata(): boolean {
    return this.metadata !== undefined && Object.keys(this.metadata).length > 0
  }

  belongsToUser(userId: string): boolean {
    return this.userId === userId
  }

  isForBadge(badgeId: string): boolean {
    return this.badgeId === badgeId
  }

  isRelatedToSpecificChallenge(challengeId: string): boolean {
    return this.relatedChallengeId === challengeId
  }

  getMetadataValue<T = any>(key: string): T | undefined {
    return this.metadata?.[key]
  }

  hasMetadataKey(key: string): boolean {
    return this.metadata !== undefined && key in this.metadata
  }

  toPlainObject(): UserBadgeProps {
    return {
      id: this.id,
      userId: this.userId,
      badgeId: this.badgeId,
      earnedAt: this.earnedAt,
      relatedChallengeId: this.relatedChallengeId,
      metadata: this.metadata,
    }
  }
}
