export enum ParticipationStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

export interface WorkoutSession {
  id: string
  date: Date
  duration: number
  caloriesBurned: number
  exercisesCompleted: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface ChallengeParticipationProps {
  id: string
  challengeId: string
  userId: string
  status?: ParticipationStatus
  progress?: number
  workoutSessions?: WorkoutSession[]
  joinedAt?: Date
  completedAt?: Date
  updatedAt?: Date
}

export class ChallengeParticipation {
  public readonly id: string
  public readonly challengeId: string
  public readonly userId: string
  public readonly status: ParticipationStatus
  public readonly progress: number
  public readonly workoutSessions: WorkoutSession[]
  public readonly joinedAt: Date
  public readonly completedAt?: Date
  public readonly updatedAt: Date

  constructor(props: ChallengeParticipationProps) {
    this.id = props.id
    this.challengeId = props.challengeId
    this.userId = props.userId
    this.status = props.status ?? ParticipationStatus.ACTIVE
    this.progress = props.progress ?? 0
    this.workoutSessions = props.workoutSessions ?? []
    this.joinedAt = props.joinedAt ?? new Date()
    this.completedAt = props.completedAt
    this.updatedAt = props.updatedAt ?? new Date()
  }

  addWorkoutSession(
    session: Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt'>
  ): ChallengeParticipation {
    const newSession: WorkoutSession = {
      ...session,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return new ChallengeParticipation({
      ...this.toPlainObject(),
      workoutSessions: [...this.workoutSessions, newSession],
      updatedAt: new Date(),
    })
  }

  updateWorkoutSession(
    sessionId: string,
    updates: Partial<Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt'>>
  ): ChallengeParticipation {
    const sessions = this.workoutSessions.map((session) =>
      session.id === sessionId ? { ...session, ...updates, updatedAt: new Date() } : session
    )

    return new ChallengeParticipation({
      ...this.toPlainObject(),
      workoutSessions: sessions,
      updatedAt: new Date(),
    })
  }

  removeWorkoutSession(sessionId: string): ChallengeParticipation {
    return new ChallengeParticipation({
      ...this.toPlainObject(),
      workoutSessions: this.workoutSessions.filter((session) => session.id !== sessionId),
      updatedAt: new Date(),
    })
  }

  updateProgress(progress: number): ChallengeParticipation {
    const clampedProgress = Math.min(Math.max(progress, 0), 100)
    const status = clampedProgress === 100 ? ParticipationStatus.COMPLETED : this.status
    const completedAt = clampedProgress === 100 ? new Date() : this.completedAt

    return new ChallengeParticipation({
      ...this.toPlainObject(),
      progress: clampedProgress,
      status,
      completedAt,
      updatedAt: new Date(),
    })
  }

  abandon(): ChallengeParticipation {
    return new ChallengeParticipation({
      ...this.toPlainObject(),
      status: ParticipationStatus.ABANDONED,
      updatedAt: new Date(),
    })
  }

  complete(): ChallengeParticipation {
    return new ChallengeParticipation({
      ...this.toPlainObject(),
      status: ParticipationStatus.COMPLETED,
      progress: 100,
      completedAt: new Date(),
      updatedAt: new Date(),
    })
  }

  getTotalCaloriesBurned(): number {
    return this.workoutSessions.reduce((total, session) => total + session.caloriesBurned, 0)
  }

  getTotalWorkoutTime(): number {
    return this.workoutSessions.reduce((total, session) => total + session.duration, 0)
  }

  getWorkoutSessionCount(): number {
    return this.workoutSessions.length
  }

  isCompleted(): boolean {
    return this.status === ParticipationStatus.COMPLETED
  }

  isActive(): boolean {
    return this.status === ParticipationStatus.ACTIVE
  }

  isAbandoned(): boolean {
    return this.status === ParticipationStatus.ABANDONED
  }

  belongsToUser(userId: string): boolean {
    return this.userId === userId
  }

  belongsToChallenge(challengeId: string): boolean {
    return this.challengeId === challengeId
  }

  hasWorkoutSessions(): boolean {
    return this.workoutSessions.length > 0
  }

  getWorkoutSession(sessionId: string): WorkoutSession | undefined {
    return this.workoutSessions.find((session) => session.id === sessionId)
  }

  private toPlainObject(): ChallengeParticipationProps {
    return {
      id: this.id,
      challengeId: this.challengeId,
      userId: this.userId,
      status: this.status,
      progress: this.progress,
      workoutSessions: this.workoutSessions,
      joinedAt: this.joinedAt,
      completedAt: this.completedAt,
      updatedAt: this.updatedAt,
    }
  }
}
