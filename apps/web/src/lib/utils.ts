import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const PET_LABELS = {
  species: { dog: 'Perro', cat: 'Gato', other: 'Otro' },
  size: { small: 'Pequeño', medium: 'Mediano', large: 'Grande' },
  age: { puppy: 'Cachorro', young: 'Joven', adult: 'Adulto', senior: 'Senior' },
  sex: { male: 'Macho', female: 'Hembra' },
  status: { available: 'Disponible', in_process: 'En proceso', adopted: 'Adoptado' },
} as const
