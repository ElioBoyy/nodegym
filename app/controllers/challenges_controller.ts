import type { HttpContext } from '@adonisjs/core/http'
import '../types/http.js'
import { CreateChallenge } from '../application/use_cases/challenge/create_challenge.js'
import { JoinChallenge } from '../application/use_cases/challenge/join_challenge.js'
import { GetChallengeById } from '../application/use_cases/challenge/get_challenge_by_id.js'
import { GetChallenges } from '../application/use_cases/challenge/get_challenges.js'
import { UpdateChallenge } from '../application/use_cases/challenge/update_challenge.js'
import { DeleteChallenge } from '../application/use_cases/challenge/delete_challenge.js'
import { LeaveChallenge } from '../application/use_cases/challenge/leave_challenge.js'
import { GetChallengeParticipants } from '../application/use_cases/challenge/get_challenge_participants.js'
import {
  CreateChallengeDto,
  UpdateChallengeDto,
  ChallengeResponseDto,
  ChallengeListDto,
} from '../dto/challenge.dto.js'

export default class ChallengesController {
  constructor(
    private createChallengeUseCase: CreateChallenge,
    private joinChallengeUseCase: JoinChallenge,
    private getChallengeByIdUseCase: GetChallengeById,
    private getChallengesUseCase: GetChallenges,
    private updateChallengeUseCase: UpdateChallenge,
    private deleteChallengeUseCase: DeleteChallenge,
    private leaveChallengeUseCase: LeaveChallenge,
    private getChallengeParticipantsUseCase: GetChallengeParticipants
  ) {}

  async index({ request, response }: HttpContext) {
    try {
      const page = Number(request.input('page', 1))
      const limit = Number(request.input('limit', 10))
      const status = request.input('status')
      const difficulty = request.input('difficulty')
      const gymId = request.input('gymId')
      const creatorId = request.input('creatorId')

      const result = await this.getChallengesUseCase.execute({
        filters: { status, difficulty, gymId, creatorId },
        pagination: { page, limit },
      })

      const challengeListDto: ChallengeListDto = {
        challenges: result.challenges.map((challenge) => this.mapToChallengeResponse(challenge)),
        total: result.total,
        page: result.page,
        limit: result.limit,
      }

      return response.json(challengeListDto)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const challenge = await this.getChallengeByIdUseCase.execute(params.id)
      return response.json(this.mapToChallengeResponse(challenge))
    } catch (error) {
      return response.status(404).json({ error: error.message })
    }
  }

  async create({ request, response, auth }: HttpContext) {
    try {
      if (!auth) {
        return response.status(401).json({ error: 'Authentication required' })
      }
      const data = request.body() as CreateChallengeDto
      const creatorId = auth.getUserId()

      const challenge = await this.createChallengeUseCase.execute({ ...data, creatorId })
      return response.status(201).json(this.mapToChallengeResponse(challenge))
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async update({ params, request, response, auth }: HttpContext) {
    try {
      if (!auth) {
        return response.status(401).json({ error: 'Authentication required' })
      }
      const data = request.body() as UpdateChallengeDto
      const userId = auth.getUserId()

      const challenge = await this.updateChallengeUseCase.execute({
        challengeId: params.id,
        userId,
        ...data,
      })
      return response.json(this.mapToChallengeResponse(challenge))
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async delete({ params, response, auth }: HttpContext) {
    try {
      if (!auth) {
        return response.status(401).json({ error: 'Authentication required' })
      }
      const userId = auth.getUserId()

      await this.deleteChallengeUseCase.execute({
        challengeId: params.id,
        userId,
      })
      return response.status(204).send('')
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async join({ params, response, auth }: HttpContext) {
    try {
      if (!auth) {
        return response.status(401).json({ error: 'Authentication required' })
      }
      const userId = auth.getUserId()

      const participation = await this.joinChallengeUseCase.execute({
        challengeId: params.id,
        userId,
      })
      return response.status(201).json(participation)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async leave({ params, response, auth }: HttpContext) {
    try {
      if (!auth) {
        return response.status(401).json({ error: 'Authentication required' })
      }
      const userId = auth.getUserId()

      await this.leaveChallengeUseCase.execute({
        challengeId: params.id,
        userId,
      })
      return response.status(204).send('')
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async participants({ params, request, response }: HttpContext) {
    try {
      const page = Number(request.input('page', 1))
      const limit = Number(request.input('limit', 10))
      const status = request.input('status')

      const result = await this.getChallengeParticipantsUseCase.execute({
        challengeId: params.id,
        filters: { status },
        pagination: { page, limit },
      })

      return response.json(result)
    } catch (error) {
      return response.status(404).json({ error: error.message })
    }
  }

  private mapToChallengeResponse(challenge: any): ChallengeResponseDto {
    return {
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      objectives: challenge.objectives,
      exerciseTypes: challenge.exerciseTypes,
      duration: challenge.duration,
      difficulty: challenge.difficulty,
      creatorId: challenge.creatorId,
      gymId: challenge.gymId,
      status: challenge.status,
      maxParticipants: challenge.maxParticipants,
      currentParticipants: challenge.currentParticipants,
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt,
    }
  }
}
