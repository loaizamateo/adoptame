import mongoose, { Document, Schema } from 'mongoose'

export type PetStatus = 'available' | 'in_process' | 'adopted'

export interface IPet extends Document {
  name: string
  species: 'dog' | 'cat' | 'other'
  breed?: string
  age: 'puppy' | 'young' | 'adult' | 'senior'
  size: 'small' | 'medium' | 'large'
  sex: 'male' | 'female'
  color?: string
  description: string
  story?: string
  photos: string[]
  status: PetStatus
  compatibleWithKids: boolean
  compatibleWithPets: boolean
  vaccinated: boolean
  sterilized: boolean
  dewormed: boolean
  urgent: boolean
  city: string
  country: string
  foundationId: mongoose.Types.ObjectId
}

const PetSchema = new Schema<IPet>(
  {
    name: { type: String, required: true, trim: true },
    species: { type: String, enum: ['dog', 'cat', 'other'], required: true },
    breed: String,
    age: { type: String, enum: ['puppy', 'young', 'adult', 'senior'], required: true },
    size: { type: String, enum: ['small', 'medium', 'large'], required: true },
    sex: { type: String, enum: ['male', 'female'], required: true },
    color: String,
    description: { type: String, required: true },
    story: String,
    photos: [{ type: String }],
    status: { type: String, enum: ['available', 'in_process', 'adopted'], default: 'available' },
    compatibleWithKids: { type: Boolean, default: false },
    compatibleWithPets: { type: Boolean, default: false },
    vaccinated: { type: Boolean, default: false },
    sterilized: { type: Boolean, default: false },
    dewormed: { type: Boolean, default: false },
    urgent: { type: Boolean, default: false },
    city: { type: String, required: true },
    country: { type: String, required: true },
    foundationId: { type: Schema.Types.ObjectId, ref: 'Foundation', required: true },
  },
  { timestamps: true }
)

PetSchema.index({ species: 1, status: 1, city: 1, country: 1 })
PetSchema.index({ urgent: -1, createdAt: -1 })
PetSchema.index({ name: 'text', description: 'text', breed: 'text' })
PetSchema.index({ foundationId: 1, status: 1 })

export const Pet = mongoose.model<IPet>('Pet', PetSchema)
