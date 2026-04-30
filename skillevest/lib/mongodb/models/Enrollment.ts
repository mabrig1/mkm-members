import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IEnrollment extends Document {
  user_id: mongoose.Types.ObjectId
  track_id: mongoose.Types.ObjectId
  status: 'active' | 'paused' | 'completed' | 'dropped'
  current_day: number
  progress_percentage: number
  started_at: Date
  completed_at?: Date
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
    track_id: { type: Schema.Types.ObjectId, ref: 'Track', required: true },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed', 'dropped'],
      default: 'active',
    },
    current_day: { type: Number, default: 1, min: 1 },
    progress_percentage: { type: Number, default: 0, min: 0, max: 100 },
    started_at: { type: Date, default: Date.now },
    completed_at: Date,
  },
  { timestamps: false }
)

EnrollmentSchema.index({ user_id: 1, track_id: 1 }, { unique: true })
EnrollmentSchema.index({ user_id: 1, status: 1 })

const Enrollment: Model<IEnrollment> =
  mongoose.models.Enrollment ?? mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema)

export default Enrollment
