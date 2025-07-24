import { AggregateRoot } from '../events/aggregate_root.js'
import { ChallengeCreatedEvent } from '../events/challenge_events.js'

export enum ChallengeStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ChallengeDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export interface ChallengeProps {
  title: string
  description: string
  objectives: string[]
  exerciseTypes: string[]
  duration: number
  difficulty: ChallengeDifficulty
  creatorId: string
  gymId?: string
  status?: ChallengeStatus
  maxParticipants?: number
  startDate?: Date
  endDate?: Date
}

export class Challenge extends AggregateRoot {
  public readonly id: string
  public readonly title: string
  public readonly description: string
  public readonly objectives: string[]
  public readonly exerciseTypes: string[]
  public readonly duration: number
  public readonly difficulty: ChallengeDifficulty
  public readonly creatorId: string
  public readonly gymId?: string
  public readonly status: ChallengeStatus
  public readonly maxParticipants: number
  public readonly startDate: Date
  public readonly endDate: Date
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: ChallengeProps & { id: string; createdAt: Date; updatedAt: Date }) {
    super()
    this.id = props.id
    this.title = props.title
    this.description = props.description
    this.objectives = props.objectives
    this.exerciseTypes = props.exerciseTypes
    this.duration = props.duration
    this.difficulty = props.difficulty
    this.creatorId = props.creatorId
    this.gymId = props.gymId
    this.status = props.status ?? ChallengeStatus.ACTIVE
    this.maxParticipants = props.maxParticipants ?? 50
    this.startDate = props.startDate ?? new Date()
    this.endDate = props.endDate ?? new Date(Date.now() + props.duration * 24 * 60 * 60 * 1000)
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(props: ChallengeProps): Challenge {
    const challenge = new Challenge({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    challenge.addDomainEvent(
      new ChallengeCreatedEvent(
        challenge.id,
        challenge.title,
        challenge.creatorId,
        challenge.gymId || ''
      )
    )

    return challenge
  }

  static fromSnapshot(
    props: ChallengeProps & { id: string; createdAt: Date; updatedAt: Date }
  ): Challenge {
    return new Challenge(props)
  }

  complete(): Challenge {
    return new Challenge({
      ...this.toPlainObject(),
      status: ChallengeStatus.COMPLETED,
      updatedAt: new Date(),
    })
  }

  cancel(): Challenge {
    return new Challenge({
      ...this.toPlainObject(),
      status: ChallengeStatus.CANCELLED,
      updatedAt: new Date(),
    })
  }

  update(
    data: Partial<
      Pick<
        ChallengeProps,
        | 'title'
        | 'description'
        | 'objectives'
        | 'exerciseTypes'
        | 'duration'
        | 'difficulty'
        | 'maxParticipants'
      >
    >
  ): Challenge {
    return new Challenge({
      ...this.toPlainObject(),
      ...data,
      updatedAt: new Date(),
    })
  }

  isActive(): boolean {
    return this.status === ChallengeStatus.ACTIVE
  }

  isCompleted(): boolean {
    return this.status === ChallengeStatus.COMPLETED
  }

  isCancelled(): boolean {
    return this.status === ChallengeStatus.CANCELLED
  }

  isGymSpecific(): boolean {
    return this.gymId !== undefined
  }

  belongsTo(creatorId: string): boolean {
    return this.creatorId === creatorId
  }

  belongsToGym(gymId: string): boolean {
    return this.gymId === gymId
  }

  hasMaxParticipants(): boolean {
    return this.maxParticipants !== undefined
  }

  canAcceptParticipants(currentParticipants: number): boolean {
    return !this.hasMaxParticipants() || currentParticipants < this.maxParticipants!
  }

  private toPlainObject(): ChallengeProps & { id: string; createdAt: Date; updatedAt: Date } {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      objectives: this.objectives,
      exerciseTypes: this.exerciseTypes,
      duration: this.duration,
      difficulty: this.difficulty,
      creatorId: this.creatorId,
      gymId: this.gymId,
      status: this.status,
      maxParticipants: this.maxParticipants,
      startDate: this.startDate,
      endDate: this.endDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
