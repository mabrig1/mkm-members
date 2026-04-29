import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IGigApplication extends Document {
  gig_id: mongoose.Types.ObjectId
  user_id: mongoose.Types.ObjectId
  pitch: string
  proposed_timeline_hours?: number
  created_at: Date
}

const GigApplicationSchema = new Schema<IGigApplication>(
  {
    gig_id: { type: Schema.Types.ObjectId, ref: 'Gig', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
    pitch: { type: String, required: true },
    proposed_timeline_hours: { type: Number, min: 1 },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
)

GigApplicationSchema.index({ gig_id: 1, user_id: 1 }, { unique: true })
GigApplicationSchema.index({ user_id: 1 })

const GigApplication: Model<IGigApplication> =
  mongoose.models.GigApplication ??
  mongoose.model<IGigApplication>('GigApplication', GigApplicationSchema)

export default GigApplication
