import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import { DIContainer } from '../app/infrastructure/dependency_injection/container.js'
import AuthController from '../app/controllers/auth_controller.js'
import ClientController from '../app/controllers/client_controller.js'
import GymOwnerController from '../app/controllers/gym_owner_controller.js'
import GymsController from '../app/controllers/gyms_controller.js'
import ParticipationsController from '../app/controllers/participations_controller.js'
import BadgesController from '../app/controllers/badges_controller.js'
import ExerciseTypesController from '../app/controllers/exercise_types_controller.js'
import AdminController from '../app/controllers/admin_controller.js'
import ChallengesController from '../app/controllers/challenges_controller.js'

const container = DIContainer.getInstance()

const authController = new AuthController(
  container.get('CreateUser'),
  container.get('AuthenticateUser'),
  container.get('GetUserById'),
  container.get('JwtService'),
  container.get('UserRepository')
)

const clientController = new ClientController(
  container.get('GetDashboardData'),
  container.get('GetUserStats'),
  container.get('GetWorkoutHistory'),
  container.get('GetUserParticipations'),
  container.get('GetUserBadges')
)

const gymOwnerController = new GymOwnerController(
  container.get('GetGymStats'),
  container.get('GetGymChallenges'),
  container.get('UpdateGym'),
  container.get('GymRepository')
)

const gymsController = new GymsController(
  container.get('CreateGym'),
  container.get('GetGymById'),
  container.get('GetGyms'),
  container.get('UpdateGym')
)

const challengesController = new ChallengesController(
  container.get('CreateChallenge'),
  container.get('JoinChallenge'),
  container.get('GetChallengeById'),
  container.get('GetChallenges'),
  container.get('UpdateChallenge'),
  container.get('DeleteChallenge'),
  container.get('LeaveChallenge'),
  container.get('GetChallengeParticipants')
)

const participationsController = new ParticipationsController(
  container.get('AddWorkoutSession'),
  container.get('GetParticipationById'),
  container.get('GetUserParticipations'),
  container.get('UpdateWorkoutSession'),
  container.get('DeleteWorkoutSession')
)

const badgesController = new BadgesController(
  container.get('GetBadges'),
  container.get('GetBadgeById'),
  container.get('GetUserBadges')
)

const exerciseTypesController = new ExerciseTypesController(
  container.get('GetExerciseTypes'),
  container.get('GetExerciseTypeById')
)

const adminController = new AdminController(
  container.get('GetDashboardStats'),
  container.get('GetUsers'),
  container.get('GetUserById'),
  container.get('ActivateUser'),
  container.get('DeactivateUser'),
  container.get('ApproveGym'),
  container.get('GetPendingGyms'),
  container.get('CreateBadge'),
  container.get('GetBadges'),
  container.get('UpdateBadge'),
  container.get('DeleteBadge'),
  container.get('CreateExerciseType'),
  container.get('GetExerciseTypes'),
  container.get('UpdateExerciseType'),
  container.get('DeleteExerciseType')
)

router.get('/', async () => {
  return {
    message: 'Gym API',
    version: '2.0.0',
    features: [
      'User Management with Role-Based Access',
      'Gym Management with Approval Workflow',
      'Challenge System with Participation Tracking',
      'Dynamic Badge System with Rules Engine',
      'Exercise Type Catalog',
      'Workout Session Tracking',
      'Real-time Analytics & Statistics',
    ],
  }
})

router
  .group(() => {
    router.post('/register', async (ctx) => {
      return authController.register(ctx)
    })
    router.post('/login', async (ctx) => {
      return authController.login(ctx)
    })
  })
  .prefix('/api/auth')

router
  .group(() => {
    router.post('/logout', async (ctx) => {
      return authController.logout(ctx)
    })
    router.get('/me', async (ctx) => {
      return authController.me(ctx)
    })
  })
  .prefix('/api/auth')
  .middleware(middleware.auth())

router
  .group(() => {
    router.get('/', async (ctx) => {
      return gymsController.index(ctx)
    })
    router.get('/:id', async (ctx) => {
      return gymsController.show(ctx)
    })
    router.post('/', async (ctx) => {
      return gymsController.create(ctx)
    })
    router.put('/:id', async (ctx) => {
      return gymsController.update(ctx)
    })
  })
  .prefix('/api/gyms')
  .middleware(middleware.auth())

router
  .group(() => {
    router.get('/', async (ctx) => {
      return challengesController.index(ctx)
    })
    router.get('/:id', async (ctx) => {
      return challengesController.show(ctx)
    })
    router.post('/', async (ctx) => {
      return challengesController.create(ctx)
    })
    router.put('/:id', async (ctx) => {
      return challengesController.update(ctx)
    })
    router.delete('/:id', async (ctx) => {
      return challengesController.delete(ctx)
    })
    router.post('/:id/join', async (ctx) => {
      return challengesController.join(ctx)
    })
    router.delete('/:id/leave', async (ctx) => {
      return challengesController.leave(ctx)
    })
    router.get('/:id/participants', async (ctx) => {
      return challengesController.participants(ctx)
    })
  })
  .prefix('/api/challenges')
  .middleware(middleware.auth())

router
  .group(() => {
    router.get('/', async (ctx) => {
      return participationsController.index(ctx)
    })
    router.get('/:id', async (ctx) => {
      return participationsController.show(ctx)
    })
    router.post('/:id/workout-sessions', async (ctx) => {
      return participationsController.addWorkoutSession(ctx)
    })
    router.put('/:id/workout-sessions/:sessionId', async (ctx) => {
      return participationsController.updateWorkoutSession(ctx)
    })
    router.delete('/:id/workout-sessions/:sessionId', async (ctx) => {
      return participationsController.deleteWorkoutSession(ctx)
    })
  })
  .prefix('/api/participations')
  .middleware(middleware.auth())

router
  .group(() => {
    router
      .group(() => {
        router.get('/', async (ctx) => {
          return badgesController.index(ctx)
        })
        router.get('/:id', async (ctx) => {
          return badgesController.show(ctx)
        })
      })
      .prefix('/badges')
    router.get('/my-badges', async (ctx) => {
      return badgesController.myBadges(ctx)
    })
  })
  .prefix('/api')
  .middleware(middleware.auth())

router
  .group(() => {
    router.get('/', async (ctx) => {
      return exerciseTypesController.index(ctx)
    })
    router.get('/:id', async (ctx) => {
      return exerciseTypesController.show(ctx)
    })
  })
  .prefix('/api/exercise-types')
  .middleware(middleware.auth())

router
  .group(() => {
    router.get('/users', async (ctx) => {
      return adminController.listUsers(ctx)
    })
    router.get('/users/:id', async (ctx) => {
      return adminController.showUser(ctx)
    })
    router.delete('/users/:id', async (ctx) => {
      return adminController.deactivateUser(ctx)
    })
    router.patch('/users/:id/activate', async (ctx) => {
      return adminController.activateUser(ctx)
    })
    router.get('/gyms/pending', async (ctx) => {
      return adminController.pendingGyms(ctx)
    })
    router.patch('/gyms/:id/approve', async (ctx) => {
      return adminController.approveGym(ctx)
    })
    router.post('/badges', async (ctx) => {
      return adminController.createBadge(ctx)
    })
    router.get('/badges', async (ctx) => {
      return adminController.listBadges(ctx)
    })
    router.put('/badges/:id', async (ctx) => {
      return adminController.updateBadge(ctx)
    })
    router.delete('/badges/:id', async (ctx) => {
      return adminController.deleteBadge(ctx)
    })
    router.post('/exercise-types', async (ctx) => {
      return adminController.createExerciseType(ctx)
    })
    router.get('/exercise-types', async (ctx) => {
      return adminController.listExerciseTypes(ctx)
    })
    router.put('/exercise-types/:id', async (ctx) => {
      return adminController.updateExerciseType(ctx)
    })
    router.delete('/exercise-types/:id', async (ctx) => {
      return adminController.deleteExerciseType(ctx)
    })

    router.get('/stats', async (ctx) => {
      return adminController.getStats(ctx)
    })
  })
  .prefix('/api/admin')
  .middleware([middleware.auth(), middleware.superAdmin()])

router
  .group(() => {
    router.get('/gym', async (ctx) => {
      return gymOwnerController.myGym(ctx)
    })
    router.put('/gym', async (ctx) => {
      return gymOwnerController.updateMyGym(ctx)
    })
    router.get('/challenges', async (ctx) => {
      return gymOwnerController.myGymChallenges(ctx)
    })
    router.get('/stats', async (ctx) => {
      return gymOwnerController.getStats(ctx)
    })
  })
  .prefix('/api/owner')
  .middleware([middleware.auth(), middleware.gymOwner()])

router
  .group(() => {
    router.get('/dashboard', async (ctx) => {
      return clientController.dashboard(ctx)
    })
    router.get('/challenges', async (ctx) => {
      return clientController.myChallenges(ctx)
    })
    router.get('/badges', async (ctx) => {
      return clientController.myBadges(ctx)
    })
    router.get('/stats', async (ctx) => {
      return clientController.getStats(ctx)
    })
    router.get('/workout-history', async (ctx) => {
      return clientController.workoutHistory(ctx)
    })
  })
  .prefix('/api/client')
  .middleware([middleware.auth(), middleware.client()])
