export interface AdminDashboardDto {
  totalUsers: number
  activeUsers: number
  totalGyms: number
  approvedGyms: number
  pendingGyms: number
  totalChallenges: number
  activeChallenges: number
  totalBadges: number
  activeBadges: number
  totalParticipations: number
  activeParticipations: number
  recentUsers: Array<{
    id: string
    email: string
    role: string
    createdAt: Date
  }>
  recentGyms: Array<{
    id: string
    name: string
    status: string
    createdAt: Date
  }>
}

export interface ClientDashboardDto {
  activeChallenges: number
  completedChallenges: number
  totalBadges: number
  totalWorkoutTime: number
  totalCaloriesBurned: number
  currentStreak: number
  monthlyStats: {
    workoutSessions: number
    totalTime: number
    totalCalories: number
  }
  recentChallenges: Array<{
    id: string
    title: string
    progress: number
    status: string
  }>
  recentBadges: Array<{
    id: string
    badgeId: string
    name: string
    earnedAt: Date
  }>
}

export interface GymOwnerDashboardDto {
  gym: {
    id: string
    name: string
    status: string
    totalChallenges: number
    totalParticipants: number
  }
  challengeStats: {
    total: number
    active: number
    completed: number
  }
  participationStats: {
    total: number
    active: number
    completed: number
  }
  monthlyStats: {
    newParticipants: number
    completedChallenges: number
    totalWorkoutSessions: number
  }
  recentChallenges: Array<{
    id: string
    title: string
    participantsCount: number
    status: string
    createdAt: Date
  }>
}
