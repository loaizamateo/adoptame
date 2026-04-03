import mongoose, { Document, Schema } from 'mongoose'

export type FosterHomeStatus = 'available' | 'occupied' | 'inactive'

export interface IFosterHome extends Document {
  userId: mongoose.Types.ObjectId
  name: string
  bio?: string
  city: string
  country: string
  phone?: string
  acceptedSpecies: ('dog' | 'cat' | 'other')[]
  acceptedSizes: ('small' | 'medium' | 'large')[]
  capacity: number
  currentCount: number
  acceptsKids: boolean
  acceptsPets: boolean
  status: FosterHomeStatus
  experience?: string
  photos?: string[]
}

const FosterHomeSchema = new Schema<IFosterHome>(
  {
    userId:          { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name:            { type: String, required: true, trim: true },
    bio:             { type: String, trim: true },
    city:            { type: String, required: true, trim: true },
    country:         { type: String, required: true, trim: true, default: 'Colombia' },
    phone:           { type: String, trim: true },
    acceptedSpecies: { type: [String], enum: ['dog', 'cat', 'other'], default: ['dog', 'cat'] },
    acceptedSizes:   { type: [String], enum: ['small', 'medium', 'large'], default: ['small', 'medium', 'large'] },
    capacity:        { type: Number, default: 1, min: 1, max: 10 },
    currentCount:    { type: Number, default: 0, min: 0 },
    acceptsKids:     { type: Boolean, default: false },
    acceptsPets:     { type: Boolean, default: false },
    status:          { type: String, enum: ['available', 'occupied', 'inactive'], default: 'available' },
    experience:      { type: String, trim: true },
    photos:          [String],
  },
  { timestamps: true }
)

FosterHomeSchema.index({ city: 1, status: 1 })
FosterHomeSchema.index({ acceptedSpecies: 1 })

export const FosterHome = mongoose.model<IFosterHome>('FosterHome', FosterHomeSchema)
