export enum GymStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface GymProps {
  id: string
  name: string
  address: string
  contact: string
  description: string
  capacity: number
  equipment: string[]
  activities: string[]
  ownerId: string
  status?: GymStatus
  createdAt?: Date
  updatedAt?: Date
}

export class Gym {
  public readonly id: string
  public readonly name: string
  public readonly address: string
  public readonly contact: string
  public readonly description: string
  public readonly capacity: number
  public readonly equipment: string[]
  public readonly activities: string[]
  public readonly ownerId: string
  public readonly status: GymStatus
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: GymProps) {
    this.id = props.id
    this.name = props.name
    this.address = props.address
    this.contact = props.contact
    this.description = props.description
    this.capacity = props.capacity
    this.equipment = props.equipment
    this.activities = props.activities
    this.ownerId = props.ownerId
    this.status = props.status ?? GymStatus.PENDING
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
  }

  approve(): Gym {
    return new Gym({
      ...this.toPlainObject(),
      status: GymStatus.APPROVED,
      updatedAt: new Date(),
    })
  }

  reject(): Gym {
    return new Gym({
      ...this.toPlainObject(),
      status: GymStatus.REJECTED,
      updatedAt: new Date(),
    })
  }

  update(
    data: Partial<
      Pick<
        GymProps,
        'name' | 'address' | 'contact' | 'description' | 'capacity' | 'equipment' | 'activities'
      >
    >
  ): Gym {
    return new Gym({
      ...this.toPlainObject(),
      ...data,
      updatedAt: new Date(),
    })
  }

  isApproved(): boolean {
    return this.status === GymStatus.APPROVED
  }

  isPending(): boolean {
    return this.status === GymStatus.PENDING
  }

  isRejected(): boolean {
    return this.status === GymStatus.REJECTED
  }

  belongsTo(ownerId: string): boolean {
    return this.ownerId === ownerId
  }

  private toPlainObject(): GymProps {
    return {
      id: this.id,
      name: this.name,
      address: this.address,
      contact: this.contact,
      description: this.description,
      capacity: this.capacity,
      equipment: this.equipment,
      activities: this.activities,
      ownerId: this.ownerId,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
