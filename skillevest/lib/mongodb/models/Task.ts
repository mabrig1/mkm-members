import mongoose, { Document, Model, Schema } from 'mongoose'

export interface ITask extends Document {
  track_id: mongoose.Types.ObjectId
  day_number: number
  title: string
  description: string
  instructions: string
  submission_type: 'text' | 'file' | 'link' | 'image'
  grading_rubric: Record<string, number>
  max_score: number
  xp_reward: number
  naira_reward: number
  resources: unknown[]
  is_peer_reviewed: boolean
  created_at: Date
}

const TaskSchema = new Schema<ITask>(
  {
    track_id: { type: Schema.Types.ObjectId, ref: 'Track', required: true },
    day_number: { type: Number, required: true, min: 1 },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    instructions: { type: String, required: true },
    submission_type: {
      type: String,
      enum: ['text', 'file', 'link', 'image'],
      default: 'text',
    },
    grading_rubric: { type: Schema.Types.Mixed, default: {} },
    max_score: { type: Number, default: 100 },
    xp_reward: { type: Number, default: 50 },
    naira_reward: { type: Number, default: 0 },
    resources: { type: [Schema.Types.Mixed] as unknown as typeof Schema.Types.Mixed, default: [] },
    is_peer_reviewed: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
)

TaskSchema.index({ track_id: 1, day_number: 1 }, { unique: true })

const Task: Model<ITask> =
  mongoose.models.Task ?? mongoose.model<ITask>('Task', TaskSchema)

export default Task
