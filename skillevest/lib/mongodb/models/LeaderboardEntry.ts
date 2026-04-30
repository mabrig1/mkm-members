import mongoose, { Document, Model, Schema } from 'mongoose'

export interface ILeaderboardEntry extends Document {
  user_id: mongoose.Types.ObjectId
  week_start: Date
  total_earned_naira: number
  gigs_completed: number
  tasks_completed: number
  xp_gained: number
  rank?: number
  university?: string
  category?: string
  created_at: Date
}

const LeaderboardEntrySchema = new Schema<ILeaderboardEntry>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
    week_start: { type: Date, required: true },
    total_earned_naira: { type: Number, default: 0 },
    gigs_completed: { type: Number, default: 0 },
    tasks_completed: { type: Number, default: 0 },
    xp_gained: { type: Number, default: 0 },
    rank: Number,
    university: String,
    category: String,
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
)

LeaderboardEntrySchema.index({ user_id: 1, week_start: 1 }, { unique: true })
LeaderboardEntrySchema.index({ week_start: 1, total_earned_naira: -1 })
LeaderboardEntrySchema.index({ week_start: 1, xp_gained: -1 })

const LeaderboardEntry: Model<ILeaderboardEntry> =
  mongoose.models.LeaderboardEntry ??
  mongoose.model<ILeaderboardEntry>('LeaderboardEntry', LeaderboardEntrySchema)

export default LeaderboardEntry
