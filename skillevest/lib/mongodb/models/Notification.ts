import mongoose, { Document, Model, Schema } from 'mongoose'

export interface INotification extends Document {
  user_id: mongoose.Types.ObjectId
  title: string
  body: string
  type: 'task' | 'gig' | 'payment' | 'streak' | 'level_up' | 'system'
  is_read: boolean
  action_url?: string
  created_at: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['task', 'gig', 'payment', 'streak', 'level_up', 'system'],
    },
    is_read: { type: Boolean, default: false },
    action_url: String,
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
)

NotificationSchema.index({ user_id: 1, is_read: 1, created_at: -1 })

const Notification: Model<INotification> =
  mongoose.models.Notification ??
  mongoose.model<INotification>('Notification', NotificationSchema)

export default Notification
