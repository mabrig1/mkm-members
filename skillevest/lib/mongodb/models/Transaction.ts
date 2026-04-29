import mongoose, { Document, Model, Schema } from 'mongoose'

export interface ITransaction extends Document {
  user_id: mongoose.Types.ObjectId
  type: 'gig_earning' | 'withdrawal' | 'subscription' | 'bonus' | 'refund' | 'escrow_hold' | 'escrow_release' | 'platform_fee'
  amount_naira: number
  status: 'pending' | 'completed' | 'failed' | 'reversed'
  reference: string
  paystack_reference?: string
  description: string
  metadata: Record<string, unknown>
  created_at: Date
}

const TransactionSchema = new Schema<ITransaction>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
    type: {
      type: String,
      required: true,
      enum: ['gig_earning', 'withdrawal', 'subscription', 'bonus', 'refund', 'escrow_hold', 'escrow_release', 'platform_fee'],
    },
    amount_naira: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'reversed'],
      default: 'pending',
    },
    reference: { type: String, required: true, unique: true },
    paystack_reference: String,
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
)

TransactionSchema.index({ user_id: 1, created_at: -1 })
TransactionSchema.index({ reference: 1 })
TransactionSchema.index({ status: 1 })

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ??
  mongoose.model<ITransaction>('Transaction', TransactionSchema)

export default Transaction
