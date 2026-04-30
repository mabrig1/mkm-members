import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IAIFeedback {
  total_score: number
  max_score: number
  percentage: number
  criteria_scores: Record<string, number>
  strengths: string[]
  improvements: string[]
  overall_feedback: string
  passed: boolean
}

export interface IPeerReview {
  reviewer_id: mongoose.Types.ObjectId
  score: number
  feedback: string
  reviewed_at: Date
}

export interface IUserTask extends Document {
  user_id: mongoose.Types.ObjectId
  task_id: mongoose.Types.ObjectId
  track_id: mongoose.Types.ObjectId
  status: 'pending' | 'submitted' | 'graded' | 'approved' | 'rejected'
  submission_content?: string
  submission_url?: string
  ai_score?: number
  ai_feedback?: IAIFeedback
  peer_reviews: IPeerReview[]
  final_score?: number
  attempts: number
  xp_awarded: number
  submitted_at?: Date
  graded_at?: Date
  created_at: Date
}

const PeerReviewSchema = new Schema<IPeerReview>(
  {
    reviewer_id: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
    score: { type: Number, required: true, min: 0 },
    feedback: { type: String, required: true },
    reviewed_at: { type: Date, default: Date.now },
  },
  { _id: false }
)

const UserTaskSchema = new Schema<IUserTask>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
    task_id: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    track_id: { type: Schema.Types.ObjectId, ref: 'Track', required: true },
    status: {
      type: String,
      enum: ['pending', 'submitted', 'graded', 'approved', 'rejected'],
      default: 'pending',
    },
    submission_content: String,
    submission_url: String,
    ai_score: { type: Number, min: 0 },
    ai_feedback: { type: Schema.Types.Mixed },
    peer_reviews: { type: [PeerReviewSchema], default: [] },
    final_score: { type: Number, min: 0 },
    attempts: { type: Number, default: 0, min: 0 },
    xp_awarded: { type: Number, default: 0 },
    submitted_at: Date,
    graded_at: Date,
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
)

UserTaskSchema.index({ user_id: 1, task_id: 1 }, { unique: true })
UserTaskSchema.index({ user_id: 1, status: 1 })
UserTaskSchema.index({ task_id: 1, status: 1 })

const UserTask: Model<IUserTask> =
  mongoose.models.UserTask ?? mongoose.model<IUserTask>('UserTask', UserTaskSchema)

export default UserTask
