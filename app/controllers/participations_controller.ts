import type { HttpContext } from '@adonisjs/core/http'
import '../types/http.js'
import { AddWorkoutSession } from '../application/use_cases/participation/add_workout_session.js'
import { GetParticipationById } from '../application/use_cases/participation/get_participation_by_id.js'
import { GetUserParticipations } from '../application/use_cases/participation/get_user_participations.js'
import { UpdateWorkoutSession } from '../application/use_cases/participation/update_workout_session.js'
import { DeleteWorkoutSession } from '../application/use_cases/participation/delete_workout_session.js'
import {
  CreateWorkoutSessionDto,
  UpdateWorkoutSessionDto,
  ParticipationResponseDto,
} from '../dto/participation.dto.js'

export default class ParticipationsController {
  constructor(
    private addWorkoutSessionUseCase: AddWorkoutSession,
    private getParticipationByIdUseCase: GetParticipationById,
    private getUserParticipationsUseCase: GetUserParticipations,
    private updateWorkoutSessionUseCase: UpdateWorkoutSession,
    private deleteWorkoutSessionUseCase: DeleteWorkoutSession
  ) {}

  async index({ request, response, auth }: HttpContext) {
    try {
      if (!auth) {
        return response.status(401).json({ error: 'Authentication required' })
      }
      const userId = auth.getUserId()
      const page = Number(request.input('page', 1))
      const limit = Number(request.input('limit', 10))
      const status = request.input('status')

      const result = await this.getUserParticipationsUseCase.execute({
        userId,
        filters: { status },
        pagination: { page, limit },
      })

      return response.json(result)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async show({ params, response, auth }: HttpContext) {
    try {
      if (!auth) {
        return response.status(401).json({ error: 'Authentication required' })
      }
      const userId = auth.getUserId()
      const participation = await this.getParticipationByIdUseCase.execute({
        participationId: params.id,
        userId,
      })
      return response.json(this.mapToParticipationResponse(participation))
    } catch (error) {
      return response.status(404).json({ error: error.message })
    }
  }

  async addWorkoutSession({ params, request, response, auth }: HttpContext) {
    const data = request.body() as CreateWorkoutSessionDto
    try {
      if (!auth) {
        return response.status(401).json({ error: 'Authentication required' })
      }
      const userId = auth.getUserId()
      const participation = await this.addWorkoutSessionUseCase.execute({
        participationId: params.id,
        userId,
        ...data,
      })
      return response.status(201).json(this.mapToParticipationResponse(participation))
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async updateWorkoutSession({ params, request, response, auth }: HttpContext) {
    const data = request.body() as UpdateWorkoutSessionDto
    try {
      if (!auth) {
        return response.status(401).json({ error: 'Authentication required' })
      }
      const userId = auth.getUserId()
      const participation = await this.updateWorkoutSessionUseCase.execute({
        participationId: params.id,
        sessionId: params.sessionId,
        userId,
        ...data,
      })
      return response.json(this.mapToParticipationResponse(participation))
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async deleteWorkoutSession({ params, response, auth }: HttpContext) {
    try {
      if (!auth) {
        return response.status(401).json({ error: 'Authentication required' })
      }
      const userId = auth.getUserId()
      await this.deleteWorkoutSessionUseCase.execute({
        participationId: params.id,
        sessionId: params.sessionId,
        userId,
      })
      return response.status(204).send('')
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  private mapToParticipationResponse(participation: any): ParticipationResponseDto {
    return {
      id: participation.id,
      challengeId: participation.challengeId,
      userId: participation.userId,
      status: participation.status,
      progress: participation.progress,
      workoutSessions: participation.workoutSessions.map((session: any) => ({
        id: session.id,
        date: session.date,
        duration: session.duration,
        caloriesBurned: session.caloriesBurned,
        exercisesCompleted: session.exercisesCompleted,
        notes: session.notes,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      })),
      joinedAt: participation.joinedAt,
      completedAt: participation.completedAt,
      updatedAt: participation.updatedAt,
    }
  }
}
