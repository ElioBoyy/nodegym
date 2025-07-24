export enum ExerciseDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export interface ExerciseTypeProps {
  id: string
  name: string
  description: string
  targetMuscles: string[]
  difficulty: ExerciseDifficulty
  createdAt?: Date
  updatedAt?: Date
}

export class ExerciseType {
  public readonly id: string
  public readonly name: string
  public readonly description: string
  public readonly targetMuscles: string[]
  public readonly difficulty: ExerciseDifficulty
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: ExerciseTypeProps) {
    this.id = props.id
    this.name = props.name
    this.description = props.description
    this.targetMuscles = props.targetMuscles
    this.difficulty = props.difficulty
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
  }

  update(
    data: Partial<Pick<ExerciseTypeProps, 'name' | 'description' | 'targetMuscles' | 'difficulty'>>
  ): ExerciseType {
    return new ExerciseType({
      ...this.toPlainObject(),
      ...data,
      updatedAt: new Date(),
    })
  }

  updateDescription(description: string): ExerciseType {
    return new ExerciseType({
      ...this.toPlainObject(),
      description,
      updatedAt: new Date(),
    })
  }

  addTargetMuscle(muscle: string): ExerciseType {
    if (this.targetMuscles.includes(muscle)) {
      return this
    }

    return new ExerciseType({
      ...this.toPlainObject(),
      targetMuscles: [...this.targetMuscles, muscle],
      updatedAt: new Date(),
    })
  }

  removeTargetMuscle(muscle: string): ExerciseType {
    return new ExerciseType({
      ...this.toPlainObject(),
      targetMuscles: this.targetMuscles.filter((m) => m !== muscle),
      updatedAt: new Date(),
    })
  }

  targetsMuscle(muscle: string): boolean {
    return this.targetMuscles.includes(muscle)
  }

  hasDifficulty(difficulty: ExerciseDifficulty): boolean {
    return this.difficulty === difficulty
  }

  isBeginner(): boolean {
    return this.difficulty === ExerciseDifficulty.BEGINNER
  }

  isIntermediate(): boolean {
    return this.difficulty === ExerciseDifficulty.INTERMEDIATE
  }

  isAdvanced(): boolean {
    return this.difficulty === ExerciseDifficulty.ADVANCED
  }

  private toPlainObject(): ExerciseTypeProps {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      targetMuscles: this.targetMuscles,
      difficulty: this.difficulty,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
