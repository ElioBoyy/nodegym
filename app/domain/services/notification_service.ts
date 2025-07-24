export interface NotificationData {
  userId: string
  title: string
  message: string
  type: 'badge_earned' | 'challenge_completed' | 'gym_approved' | 'challenge_joined'
  metadata?: Record<string, any>
}

export interface NotificationService {
  sendNotification(data: NotificationData): Promise<void>
  sendBadgeEarned(userId: string, badgeName: string, badgeId: string): Promise<void>
  sendChallengeCompleted(userId: string, challengeTitle: string, challengeId: string): Promise<void>
  sendGymApproved(ownerId: string, gymName: string, gymId: string): Promise<void>
  sendChallengeJoined(userId: string, challengeTitle: string, challengeId: string): Promise<void>
}
