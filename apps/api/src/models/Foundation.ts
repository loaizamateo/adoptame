import mongoose, { Document, Schema } from 'mongoose'
import slugify from 'slugify'

export interface IFoundation extends Document {
  name: string
  slug: string
  description: string
  logo?: string
  city: string
  country: string
  phone?: string
  website?: string
  instagram?: string
  facebook?: string
  verified: boolean
  ownerId: mongoose.Types.ObjectId
}

const FoundationSchema = new Schema<IFoundation>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    logo: String,
    city: { type: String, required: true },
    country: { type: String, required: true },
    phone: String,
    website: String,
    instagram: String,
    facebook: String,
    verified: { type: Boolean, default: false },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

FoundationSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true })
  }
  next()
})

export const Foundation = mongoose.model<IFoundation>('Foundation', FoundationSchema)
