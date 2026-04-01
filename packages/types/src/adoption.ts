export type AdoptionStatus = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'completed'

export interface AdoptionRequest {
  _id: string
  petId: string
  pet?: import('./pet').Pet
  userId: string
  foundationId: string
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
  createdAt: string
  updatedAt: string
}
