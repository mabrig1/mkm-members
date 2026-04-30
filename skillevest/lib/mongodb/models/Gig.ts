import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IGig extends Document {
  client_id: mongoose.Types.ObjectId
  title: string
  description: string
  category: string
  budget_naira: number
  platform_fee_naira: number
  deadline_hours: number
  status: 'open' | 'assigned' | 'submitted' | 'in_review' | 'approved' | 'disputed' | 'paid' | 'cancelled'
  assigned_to?: mongoose.Types.ObjectId
  requirements: string
  deliverables: string
  min_level: string
  min_score: number
  escrow_reference?: string
  escrow_held: boolean
  dispute_reason?: string
  arbiter_ruling?: string
  client_rating?: number
  client_review?: string
  assigned_at?: Date
  submitted_at?: Date
  approved_at?: Date
  paid_at?: Date
  created_at: Date
}

const GigSchema = new Schema<IGig>(
  {
    client_id: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    budget_naira: { type: Number, required: true, min: 0 },
    platform_fee_naira: { type: Number, default: 0, min: 0 },
    deadline_hours: { type: Number, default: 48, min: 1 },
    status: {
      type: String,
      enum: ['open', 'assigned', 'submitted', 'in_review', 'approved', 'disputed', 'paid', 'cancelled'],
      default: 'open',
    },
    assigned_to: { type: Schema.Types.ObjectId, ref: 'Profile' },
    requirements: { type: String, required: true },
    deliverables: { type: String, required: true },
    min_level: { type: String, default: 'novice' },
    min_score: { type: Number, default: 0 },
    escrow_reference: String,
    escrow_held: { type: Boolean, default: false },
    dispute_reason: String,
    arbiter_ruling: String,
    client_rating: { type: Number, min: 1, max: 5 },
    client_review: String,
    assigned_at: Date,
    submitted_at: Date,
    approved_at: Date,
    paid_at: Date,
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
)

GigSchema.index({ status: 1, category: 1 })
GigSchema.index({ client_id: 1 })
GigSchema.index({ assigned_to: 1 })

const Gig: Model<IGig> =
  mongoose.models.Gig ?? mongoose.model<IGig>('Gig', GigSchema)

export default Gig
