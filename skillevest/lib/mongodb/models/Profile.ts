import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IProfile extends Document {
  _id: string
  email: string
  full_name: string
  phone?: string
  whatsapp_number?: string
  university?: string
  state?: string
  role: 'novice' | 'apprentice' | 'pro' | 'mentor' | 'admin'
  level: number
  xp_points: number
  streak_days: number
  last_active_date?: Date
  wallet_balance: number
  total_earned: number
  is_premium: boolean
  premium_expires_at?: Date
  bvn_verified: boolean
  avatar_url?: string
  fiverr_username?: string
  upwork_profile_url?: string
  referral_code: string
  referred_by?: mongoose.Types.ObjectId
  password_hash?: string
  goal?: string
  onboarding_completed: boolean
  created_at: Date
  updated_at: Date
}

const ProfileSchema = new Schema<IProfile>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    full_name: { type: String, required: true, trim: true },
    phone: { type: String, unique: true, sparse: true },
    whatsapp_number: String,
    university: String,
    state: String,
    role: {
      type: String,
      enum: ['novice', 'apprentice', 'pro', 'mentor', 'admin'],
      default: 'novice',
    },
    level: { type: Number, default: 1, min: 1 },
    xp_points: { type: Number, default: 0, min: 0 },
    streak_days: { type: Number, default: 0, min: 0 },
    last_active_date: Date,
    wallet_balance: { type: Number, default: 0, min: 0 },
    total_earned: { type: Number, default: 0, min: 0 },
    is_premium: { type: Boolean, default: false },
    premium_expires_at: Date,
    bvn_verified: { type: Boolean, default: false },
    avatar_url: String,
    fiverr_username: String,
    upwork_profile_url: String,
    referral_code: {
      type: String,
      unique: true,
      default: () => Math.random().toString(36).substring(2, 10).toUpperCase(),
    },
    referred_by: { type: Schema.Types.ObjectId, ref: 'Profile' },
    password_hash: { type: String, select: false },
    goal: String,
    onboarding_completed: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

ProfileSchema.index({ role: 1, xp_points: -1 })
ProfileSchema.index({ university: 1 })
ProfileSchema.index({ referral_code: 1 })

const Profile: Model<IProfile> =
  mongoose.models.Profile ?? mongoose.model<IProfile>('Profile', ProfileSchema)

export default Profile
