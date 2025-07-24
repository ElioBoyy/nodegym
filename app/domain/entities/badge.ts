export enum BadgeRuleType {
  CHALLENGE_COMPLETION = 'challenge_completion',
  STREAK = 'streak',
  PARTICIPATION = 'participation',
  CUSTOM = 'custom',
}

export interface BadgeRule {
  type: BadgeRuleType
  condition: string
  value: number
}

export interface BadgeProps {
  id: string
  name: string
  description: string
  iconUrl: string
  rules: BadgeRule[]
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export class Badge {
  public readonly id: string
  public readonly name: string
  public readonly description: string
  public readonly iconUrl: string
  public readonly rules: BadgeRule[]
  public readonly isActive: boolean
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: BadgeProps) {
    this.id = props.id
    this.name = props.name
    this.description = props.description
    this.iconUrl = props.iconUrl
    this.rules = props.rules
    this.isActive = props.isActive ?? true
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
  }

  deactivate(): Badge {
    return new Badge({
      ...this.toPlainObject(),
      isActive: false,
      updatedAt: new Date(),
    })
  }

  activate(): Badge {
    return new Badge({
      ...this.toPlainObject(),
      isActive: true,
      updatedAt: new Date(),
    })
  }

  updateRules(rules: BadgeRule[]): Badge {
    return new Badge({
      ...this.toPlainObject(),
      rules,
      updatedAt: new Date(),
    })
  }

  update(data: Partial<Pick<BadgeProps, 'name' | 'description' | 'iconUrl' | 'rules'>>): Badge {
    return new Badge({
      ...this.toPlainObject(),
      ...data,
      updatedAt: new Date(),
    })
  }

  hasRuleType(type: BadgeRuleType): boolean {
    return this.rules.some((rule) => rule.type === type)
  }

  getRulesByType(type: BadgeRuleType): BadgeRule[] {
    return this.rules.filter((rule) => rule.type === type)
  }

  isEligibleForUser(userStats: Record<string, number>): boolean {
    return this.rules.every((rule) => {
      const userValue = userStats[rule.condition] ?? 0
      return userValue >= rule.value
    })
  }

  private toPlainObject(): BadgeProps {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      iconUrl: this.iconUrl,
      rules: this.rules,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
