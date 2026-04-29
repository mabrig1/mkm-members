export type UserRole = 'novice' | 'apprentice' | 'pro' | 'mentor' | 'admin'
export type TrackStatus = 'locked' | 'active' | 'completed'
export type TaskStatus = 'pending' | 'submitted' | 'graded' | 'approved' | 'rejected'
export type GigStatus = 'open' | 'assigned' | 'submitted' | 'in_review' | 'approved' | 'disputed' | 'paid'
export type SkillCategory = 'copywriting' | 'design' | 'video' | 'data_entry' | 'affiliate' | 'social_media'

export interface User {
  id: string
  email: string
  full_name: string
  phone: string
  university?: string
  role: UserRole
  level: number
  xp_points: number
  streak_days: number
  wallet_balance: number
  bvn_verified: boolean
  avatar_url?: string
  whatsapp_number?: string
  fiverr_username?: string
  created_at: string
}

export interface Track {
  id: string
  title: string
  category: SkillCategory
  description: string
  duration_days: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  is_premium: boolean
  thumbnail_url?: string
  tasks_count: number
  enrolled_count: number
  completion_rate: number
  avg_earning_naira: number
  created_at: string
}

export interface Task {
  id: string
  track_id: string
  day_number: number
  title: string
  description: string
  instructions: string
  submission_type: 'text' | 'file' | 'link' | 'image'
  grading_rubric: Record<string, number>
  max_score: number
  xp_reward: number
  naira_reward?: number
  created_at: string
}

export interface UserTask {
  id: string
  user_id: string
  task_id: string
  track_id: string
  status: TaskStatus
  submission_content?: string
  submission_url?: string
  ai_score?: number
  ai_feedback?: string
  peer_score?: number
  final_score?: number
  attempts: number
  submitted_at?: string
  graded_at?: string
}

export interface Gig {
  id: string
  client_id: string
  title: string
  description: string
  category: SkillCategory
  budget_naira: number
  deadline_hours: number
  status: GigStatus
  assigned_to?: string
  requirements: string
  deliverables: string
  escrow_held: boolean
  platform_fee_naira: number
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: 'gig_earning' | 'withdrawal' | 'subscription' | 'bonus' | 'refund'
  amount_naira: number
  status: 'pending' | 'completed' | 'failed'
  reference: string
  description: string
  created_at: string
}

export interface AIGradingResult {
  total_score: number
  max_score: number
  percentage: number
  criteria_scores: Record<string, number>
  strengths: string[]
  improvements: string[]
  overall_feedback: string
  passed: boolean
}
