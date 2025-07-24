import { MongoDBConnection } from '../database/mongodb_connection.js'

import { MongoDBUserRepository } from '../repositories/mongodb_user_repository.js'
import { MongoDBGymRepository } from '../repositories/mongodb_gym_repository.js'
import { MongoDBChallengeRepository } from '../repositories/mongodb_challenge_repository.js'
import { MongoDBChallengeParticipationRepository } from '../repositories/mongodb_challenge_participation_repository.js'
import { MongoDBBadgeRepository } from '../repositories/mongodb_badge_repository.js'
import { MongoDBUserBadgeRepository } from '../repositories/mongodb_user_badge_repository.js'
import { MongoDBExerciseTypeRepository } from '../repositories/mongodb_exercise_type_repository.js'

import { AdonisPasswordService } from '../services/adonis_password_service.js'
import { JwtService } from '../services/jwt_service.js'
import { ConsoleNotificationService } from '../services/console_notification_service.js'
import { BadgeEvaluationService } from '../services/badge_evaluation_service.js'

import { CreateUser } from '../../application/use_cases/user/create_user.js'
import { AuthenticateUser } from '../../application/use_cases/user/authenticate_user.js'
import { GetUserById } from '../../application/use_cases/user/get_user_by_id.js'
import { GetUsers } from '../../application/use_cases/user/get_users.js'
import { ActivateUser } from '../../application/use_cases/user/activate_user.js'
import { DeactivateUser } from '../../application/use_cases/user/deactivate_user.js'

import { CreateGym } from '../../application/use_cases/gym/create_gym.js'
import { GetGymById } from '../../application/use_cases/gym/get_gym_by_id.js'
import { GetGyms } from '../../application/use_cases/gym/get_gyms.js'
import { UpdateGym } from '../../application/use_cases/gym/update_gym.js'
import { ApproveGym } from '../../application/use_cases/gym/approve_gym.js'
import { GetPendingGyms } from '../../application/use_cases/gym/get_pending_gyms.js'

import { CreateChallenge } from '../../application/use_cases/challenge/create_challenge.js'
import { GetChallenges } from '../../application/use_cases/challenge/get_challenges.js'
import { GetChallengeById } from '../../application/use_cases/challenge/get_challenge_by_id.js'
import { UpdateChallenge } from '../../application/use_cases/challenge/update_challenge.js'
import { DeleteChallenge } from '../../application/use_cases/challenge/delete_challenge.js'
import { JoinChallenge } from '../../application/use_cases/challenge/join_challenge.js'
import { LeaveChallenge } from '../../application/use_cases/challenge/leave_challenge.js'
import { GetChallengeParticipants } from '../../application/use_cases/challenge/get_challenge_participants.js'

import { CreateBadge } from '../../application/use_cases/badge/create_badge.js'
import { GetBadges } from '../../application/use_cases/badge/get_badges.js'
import { GetBadgeById } from '../../application/use_cases/badge/get_badge_by_id.js'
import { UpdateBadge } from '../../application/use_cases/badge/update_badge.js'
import { DeleteBadge } from '../../application/use_cases/badge/delete_badge.js'
import { GetUserBadges } from '../../application/use_cases/badge/get_user_badges.js'

import { CreateExerciseType } from '../../application/use_cases/exercise_type/create_exercise_type.js'
import { GetExerciseTypes } from '../../application/use_cases/exercise_type/get_exercise_types.js'
import { GetExerciseTypeById } from '../../application/use_cases/exercise_type/get_exercise_type_by_id.js'
import { UpdateExerciseType } from '../../application/use_cases/exercise_type/update_exercise_type.js'
import { DeleteExerciseType } from '../../application/use_cases/exercise_type/delete_exercise_type.js'

import { AddWorkoutSession } from '../../application/use_cases/participation/add_workout_session.js'
import { GetParticipationById } from '../../application/use_cases/participation/get_participation_by_id.js'
import { GetUserParticipations } from '../../application/use_cases/participation/get_user_participations.js'
import { UpdateWorkoutSession } from '../../application/use_cases/participation/update_workout_session.js'
import { DeleteWorkoutSession } from '../../application/use_cases/participation/delete_workout_session.js'

import { GetDashboardStats } from '../../application/use_cases/admin/get_dashboard_stats.js'

import { GetDashboardData } from '../../application/use_cases/client/get_dashboard_data.js'
import { GetUserStats } from '../../application/use_cases/client/get_user_stats.js'
import { GetWorkoutHistory } from '../../application/use_cases/client/get_workout_history.js'

import { GetGymStats } from '../../application/use_cases/gym_owner/get_gym_stats.js'
import { GetGymChallenges } from '../../application/use_cases/gym_owner/get_gym_challenges.js'

export class DIContainer {
  private static instance: DIContainer
  private services: Map<string, any> = new Map()

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer()
    }
    return DIContainer.instance
  }

  async initialize(): Promise<void> {
    await MongoDBConnection.getInstance().connect()
    this.registerRepositories()
    this.registerServices()
    this.registerUseCases()
  }

  private registerRepositories(): void {
    this.services.set('UserRepository', new MongoDBUserRepository())
    this.services.set('GymRepository', new MongoDBGymRepository())
    this.services.set('ChallengeRepository', new MongoDBChallengeRepository())
    this.services.set(
      'ChallengeParticipationRepository',
      new MongoDBChallengeParticipationRepository()
    )
    this.services.set('BadgeRepository', new MongoDBBadgeRepository())
    this.services.set('UserBadgeRepository', new MongoDBUserBadgeRepository())
    this.services.set('ExerciseTypeRepository', new MongoDBExerciseTypeRepository())
  }

  private registerServices(): void {
    this.services.set('PasswordService', new AdonisPasswordService())
    this.services.set('JwtService', new JwtService())
    this.services.set('NotificationService', new ConsoleNotificationService())

    const badgeEvaluationService = new BadgeEvaluationService(
      this.get('BadgeRepository'),
      this.get('UserBadgeRepository'),
      this.get('ChallengeParticipationRepository'),
      this.get('NotificationService')
    )
    this.services.set('BadgeService', badgeEvaluationService)
  }

  private registerUseCases(): void {
    this.services.set(
      'CreateUser',
      new CreateUser(this.get('UserRepository'), this.get('PasswordService'))
    )

    this.services.set(
      'AuthenticateUser',
      new AuthenticateUser(this.get('UserRepository'), this.get('PasswordService'))
    )

    this.services.set('GetUserById', new GetUserById(this.get('UserRepository')))
    this.services.set('GetUsers', new GetUsers(this.get('UserRepository')))
    this.services.set('ActivateUser', new ActivateUser(this.get('UserRepository')))
    this.services.set('DeactivateUser', new DeactivateUser(this.get('UserRepository')))

    this.services.set(
      'CreateGym',
      new CreateGym(this.get('GymRepository'), this.get('UserRepository'))
    )

    this.services.set('GetGymById', new GetGymById(this.get('GymRepository')))
    this.services.set('GetGyms', new GetGyms(this.get('GymRepository')))
    this.services.set(
      'UpdateGym',
      new UpdateGym(this.get('GymRepository'), this.get('UserRepository'))
    )

    this.services.set(
      'ApproveGym',
      new ApproveGym(
        this.get('GymRepository'),
        this.get('UserRepository'),
        this.get('NotificationService')
      )
    )

    this.services.set('GetPendingGyms', new GetPendingGyms(this.get('GymRepository')))

    this.services.set(
      'CreateChallenge',
      new CreateChallenge(
        this.get('ChallengeRepository'),
        this.get('UserRepository'),
        this.get('GymRepository')
      )
    )

    this.services.set('GetChallenges', new GetChallenges(this.get('ChallengeRepository')))
    this.services.set('GetChallengeById', new GetChallengeById(this.get('ChallengeRepository')))

    this.services.set(
      'UpdateChallenge',
      new UpdateChallenge(this.get('ChallengeRepository'), this.get('UserRepository'))
    )

    this.services.set(
      'DeleteChallenge',
      new DeleteChallenge(
        this.get('ChallengeRepository'),
        this.get('UserRepository'),
        this.get('ChallengeParticipationRepository')
      )
    )

    this.services.set(
      'JoinChallenge',
      new JoinChallenge(
        this.get('ChallengeRepository'),
        this.get('ChallengeParticipationRepository'),
        this.get('UserRepository'),
        this.get('NotificationService')
      )
    )

    this.services.set(
      'LeaveChallenge',
      new LeaveChallenge(
        this.get('ChallengeRepository'),
        this.get('ChallengeParticipationRepository'),
        this.get('UserRepository')
      )
    )

    this.services.set(
      'GetChallengeParticipants',
      new GetChallengeParticipants(
        this.get('ChallengeRepository'),
        this.get('ChallengeParticipationRepository')
      )
    )

    this.services.set(
      'CreateBadge',
      new CreateBadge(this.get('BadgeRepository'), this.get('UserRepository'))
    )

    this.services.set('GetBadges', new GetBadges(this.get('BadgeRepository')))
    this.services.set('GetBadgeById', new GetBadgeById(this.get('BadgeRepository')))

    this.services.set(
      'UpdateBadge',
      new UpdateBadge(this.get('BadgeRepository'), this.get('UserRepository'))
    )

    this.services.set(
      'DeleteBadge',
      new DeleteBadge(
        this.get('BadgeRepository'),
        this.get('UserRepository'),
        this.get('UserBadgeRepository')
      )
    )

    this.services.set(
      'GetUserBadges',
      new GetUserBadges(this.get('UserBadgeRepository'), this.get('UserRepository'))
    )

    this.services.set(
      'CreateExerciseType',
      new CreateExerciseType(this.get('ExerciseTypeRepository'), this.get('UserRepository'))
    )

    this.services.set('GetExerciseTypes', new GetExerciseTypes(this.get('ExerciseTypeRepository')))
    this.services.set(
      'GetExerciseTypeById',
      new GetExerciseTypeById(this.get('ExerciseTypeRepository'))
    )

    this.services.set(
      'UpdateExerciseType',
      new UpdateExerciseType(this.get('ExerciseTypeRepository'), this.get('UserRepository'))
    )

    this.services.set(
      'DeleteExerciseType',
      new DeleteExerciseType(this.get('ExerciseTypeRepository'), this.get('UserRepository'))
    )

    this.services.set(
      'AddWorkoutSession',
      new AddWorkoutSession(
        this.get('ChallengeParticipationRepository'),
        this.get('UserRepository'),
        this.get('BadgeService')
      )
    )

    this.services.set(
      'GetParticipationById',
      new GetParticipationById(
        this.get('ChallengeParticipationRepository'),
        this.get('UserRepository')
      )
    )

    this.services.set(
      'GetUserParticipations',
      new GetUserParticipations(
        this.get('ChallengeParticipationRepository'),
        this.get('UserRepository')
      )
    )

    this.services.set(
      'UpdateWorkoutSession',
      new UpdateWorkoutSession(
        this.get('ChallengeParticipationRepository'),
        this.get('UserRepository')
      )
    )

    this.services.set(
      'DeleteWorkoutSession',
      new DeleteWorkoutSession(
        this.get('ChallengeParticipationRepository'),
        this.get('UserRepository')
      )
    )

    this.services.set(
      'GetDashboardStats',
      new GetDashboardStats(
        this.get('UserRepository'),
        this.get('GymRepository'),
        this.get('ChallengeRepository'),
        this.get('ChallengeParticipationRepository'),
        this.get('BadgeRepository'),
        this.get('ExerciseTypeRepository')
      )
    )

    this.services.set(
      'GetDashboardData',
      new GetDashboardData(
        this.get('UserRepository'),
        this.get('ChallengeParticipationRepository'),
        this.get('UserBadgeRepository')
      )
    )

    this.services.set(
      'GetUserStats',
      new GetUserStats(
        this.get('UserRepository'),
        this.get('ChallengeParticipationRepository'),
        this.get('UserBadgeRepository')
      )
    )

    this.services.set(
      'GetWorkoutHistory',
      new GetWorkoutHistory(
        this.get('UserRepository'),
        this.get('ChallengeParticipationRepository')
      )
    )

    this.services.set(
      'GetGymStats',
      new GetGymStats(
        this.get('UserRepository'),
        this.get('GymRepository'),
        this.get('ChallengeRepository'),
        this.get('ChallengeParticipationRepository')
      )
    )

    this.services.set(
      'GetGymChallenges',
      new GetGymChallenges(
        this.get('UserRepository'),
        this.get('GymRepository'),
        this.get('ChallengeRepository')
      )
    )
  }

  get<T>(key: string): T {
    const service = this.services.get(key)
    if (!service) {
      throw new Error(`Service ${key} not found`)
    }
    return service
  }
}
