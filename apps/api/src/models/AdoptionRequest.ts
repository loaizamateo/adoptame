import mongoose, { Document, Schema } from 'mongoose'

export type AdoptionStatus = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'completed'

export interface IAdoptionRequest extends Document {
  petId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  foundationId: mongoose.Types.ObjectId
  status: AdoptionStatus
  housingType: 'house' | 'apartment' | 'farm'
  hasYard: boolean
  hasPets: boolean
  hasChildren: boolean
  experience: 'none' | 'some' | 'experienced'
  workSchedule: string
  motivation: string
  additionalInfo?: string
  notes?: string
}

const AdoptionRequestSchema = new Schema<IAdoptionRequest>(
  {
    petId: { type: Schema.Types.ObjectId, ref: 'Pet', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    foundationId: { type: Schema.Types.ObjectId, ref: 'Foundation', required: true },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    housingType: { type: String, enum: ['house', 'apartment', 'farm'], required: true },
    hasYard: { type: Boolean, default: false },
    hasPets: { type: Boolean, default: false },
    hasChildren: { type: Boolean, default: false },
    experience: { type: String, enum: ['none', 'some', 'experienced'], required: true },
    workSchedule: { type: String, required: true },
    motivation: { type: String, required: true },
    additionalInfo: String,
    notes: String,
  },
  { timestamps: true }
)

AdoptionRequestSchema.index({ userId: 1, createdAt: -1 })
AdoptionRequestSchema.index({ foundationId: 1, status: 1, createdAt: -1 })
AdoptionRequestSchema.index({ petId: 1, userId: 1, status: 1 })

export const AdoptionRequest = mongoose.model<IAdoptionRequest>(
  'AdoptionRequest',
  AdoptionRequestSchema
)
