import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

export type UserRole = 'adopter' | 'foundation' | 'admin'

export interface IUser extends Document {
  name: string
  email: string
  password?: string
  role: UserRole
  avatar?: string
  city?: string
  country?: string
  foundationId?: mongoose.Types.ObjectId
  googleId?: string
  resetPasswordToken?: string
  resetPasswordExpires?: Date
  active: boolean
  comparePassword(candidate: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    role: { type: String, enum: ['adopter', 'foundation', 'admin'], default: 'adopter' },
    avatar: String,
    city: String,
    country: String,
    foundationId: { type: Schema.Types.ObjectId, ref: 'Foundation' },
    googleId: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password!)
}

export const User = mongoose.model<IUser>('User', UserSchema)
