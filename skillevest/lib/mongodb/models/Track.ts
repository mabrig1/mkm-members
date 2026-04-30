import mongoose, { Document, Model, Schema } from 'mongoose'

export interface ITrack extends Document {
  title: string
  slug: string
  category: 'copywriting' | 'design' | 'video' | 'data_entry' | 'affiliate' | 'social_media'
  description: string
  full_description?: string
  duration_days: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  is_premium: boolean
  is_published: boolean
  thumbnail_url?: string
  preview_video_url?: string
  avg_earning_naira: number
  enrolled_count: number
  completion_rate: number
  tags: string[]
  created_at: Date
}

const TrackSchema = new Schema<ITrack>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['copywriting', 'design', 'video', 'data_entry', 'affiliate', 'social_media'],
    },
    description: { type: String, required: true },
    full_description: String,
    duration_days: { type: Number, required: true, min: 1 },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    is_premium: { type: Boolean, default: false },
    is_published: { type: Boolean, default: false },
    thumbnail_url: String,
    preview_video_url: String,
    avg_earning_naira: { type: Number, default: 0 },
    enrolled_count: { type: Number, default: 0 },
    completion_rate: { type: Number, default: 0, min: 0, max: 100 },
    tags: [{ type: String }],
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
)

TrackSchema.index({ category: 1, is_published: 1 })
TrackSchema.index({ slug: 1 })

const Track: Model<ITrack> =
  mongoose.models.Track ?? mongoose.model<ITrack>('Track', TrackSchema)

export default Track
