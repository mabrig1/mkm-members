import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IB2BClient extends Document {
  company_name: string
  contact_name: string
  email: string
  phone?: string
  industry?: string
  monthly_budget_naira?: number
  contract_type?: 'one_off' | 'monthly_retainer' | 'project_based'
  is_verified: boolean
  total_paid_naira: number
  gigs_posted: number
  created_at: Date
}

const B2BClientSchema = new Schema<IB2BClient>(
  {
    company_name: { type: String, required: true, trim: true },
    contact_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: String,
    industry: String,
    monthly_budget_naira: { type: Number, min: 0 },
    contract_type: {
      type: String,
      enum: ['one_off', 'monthly_retainer', 'project_based'],
    },
    is_verified: { type: Boolean, default: false },
    total_paid_naira: { type: Number, default: 0, min: 0 },
    gigs_posted: { type: Number, default: 0, min: 0 },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
)

B2BClientSchema.index({ email: 1 })
B2BClientSchema.index({ is_verified: 1 })

const B2BClient: Model<IB2BClient> =
  mongoose.models.B2BClient ?? mongoose.model<IB2BClient>('B2BClient', B2BClientSchema)

export default B2BClient
