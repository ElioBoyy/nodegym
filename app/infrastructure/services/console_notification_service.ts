import {
  NotificationService,
  NotificationData,
} from '../../domain/services/notification_service.js'

export class ConsoleNotificationService implements NotificationService {
  async sendNotification(data: NotificationData): Promise<void> {
    console.log(`[NOTIFICATION] ${data.type.toUpperCase()}`)
    console.log(`To: ${data.userId}`)
    console.log(`Title: ${data.title}`)
    console.log(`Message: ${data.message}`)
    if (data.metadata) {
      console.log(`Metadata:`, data.metadata)
    }
    console.log('---')
  }

  async sendBadgeEarned(userId: string, badgeName: string, badgeId: string): Promise<void> {
    await this.sendNotification({
      userId,
      title: 'Badge Earned!',
      message: `Congratulations! You earned the "${badgeName}" badge.`,
      type: 'badge_earned',
      metadata: { badgeId, badgeName },
    })
  }

  async sendChallengeCompleted(
    userId: string,
    challengeTitle: string,
    challengeId: string
  ): Promise<void> {
    await this.sendNotification({
      userId,
      title: 'Challenge Completed!',
      message: `Congratulations! You completed the "${challengeTitle}" challenge.`,
      type: 'challenge_completed',
      metadata: { challengeId, challengeTitle },
    })
  }

  async sendGymApproved(ownerId: string, gymName: string, gymId: string): Promise<void> {
    await this.sendNotification({
      userId: ownerId,
      title: 'Gym Approved!',
      message: `Your gym "${gymName}" has been approved and is now active.`,
      type: 'gym_approved',
      metadata: { gymId, gymName },
    })
  }

  async sendChallengeJoined(
    userId: string,
    challengeTitle: string,
    challengeId: string
  ): Promise<void> {
    await this.sendNotification({
      userId,
      title: 'Challenge Joined!',
      message: `You have successfully joined the "${challengeTitle}" challenge.`,
      type: 'challenge_joined',
      metadata: { challengeId, challengeTitle },
    })
  }
}
