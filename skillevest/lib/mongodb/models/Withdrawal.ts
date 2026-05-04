import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IWithdrawal extends Document {
  user_id: mongoose.Types.ObjectId
  amount_naira: number
  bank_name: string
  bank_code: string
  account_number: string
  account_name: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  paystack_transfer_code?: string
  failure_reason?: string
  requested_at: Date
  processed_at?: Date
}

const WithdrawalSchema = new Schema<IWithdrawal>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
    amount_naira: { type: Number, required: true, min: 0 },
    bank_name: { type: String, required: true },
    bank_code: { type: String, default: '' },
    account_number: { type: String, required: true },
    account_name: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    paystack_transfer_code: String,
    failure_reason: String,
    requested_at: { type: Date, default: Date.now },
    processed_at: Date,
  },
  { timestamps: false }
)

WithdrawalSchema.index({ user_id: 1, status: 1 })
WithdrawalSchema.index({ requested_at: -1 })

const Withdrawal: Model<IWithdrawal> =
  mongoose.models.Withdrawal ?? mongoose.model<IWithdrawal>('Withdrawal', WithdrawalSchema)

export default Withdrawal
