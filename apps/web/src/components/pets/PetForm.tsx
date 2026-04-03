'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createPetSchema, type CreatePetInput } from '@adoptame/schemas'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { createPet, updatePet, uploadPetPhoto } from '@/lib/pets'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Pet } from '@adoptame/types'

interface Props {
  pet?: Pet
}

export default function PetForm({ pet }: Props) {
  const router = useRouter()
  const [serverError, setServerError] = useState('')
  // photoKeys: lo que se guarda en DB (keys de B2 o URL firmada existente)
  // photoDisplayUrls: lo que se muestra en el preview (blob URL o URL firmada)
  const [photoKeys, setPhotoKeys] = useState<string[]>(() => {
    if (!pet?.photos) return []
    // Extraer el key de las URLs firmadas: .../pets/uuid.png?X-Amz-... → pets/uuid.png
    return pet.photos.map((url: string) => {
      try {
        const path = new URL(url).pathname.replace(/^\//, '')
        return path.includes('pets/') ? path : url
      } catch {
        return url
      }
    })
  })
  const [photoDisplayUrls, setPhotoDisplayUrls] = useState<string[]>(pet?.photos ?? [])
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreatePetInput>({
    resolver: zodResolver(createPetSchema),
    defaultValues: pet
      ? {
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          age: pet.age,
          size: pet.size,
          sex: pet.sex,
          color: pet.color,
          description: pet.description,
          story: pet.story,
          compatibleWithKids: pet.compatibleWithKids,
          compatibleWithPets: pet.compatibleWithPets,
          vaccinated: pet.vaccinated,
          sterilized: pet.sterilized,
          dewormed: pet.dewormed,
          urgent: pet.urgent,
          city: pet.city,
          country: pet.country,
        }
      : {},
  })

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (photoKeys.length + files.length > 8) {
      alert('Máximo 8 fotos')
      return
    }
    setUploading(true)
    try {
      for (const file of files) {
        // Preview inmediato con blob URL
        const blobUrl = URL.createObjectURL(file)
        setPhotoDisplayUrls((prev) => [...prev, blobUrl])
        // Upload y guardar key
        const key = await uploadPetPhoto(file)
        setPhotoKeys((prev) => [...prev, key])
      }
    } catch {
      alert('Error al subir fotos')
      // Revertir previews si falla
      setPhotoDisplayUrls((prev) => prev.slice(0, photoKeys.length))
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = (idx: number) => {
    setPhotoKeys((prev) => prev.filter((_, i) => i !== idx))
    setPhotoDisplayUrls((prev) => prev.filter((_, i) => i !== idx))
  }

  const onSubmit = async (data: CreatePetInput) => {
    setServerError('')
    try {
      if (pet) {
        await updatePet(pet._id, { ...data, photos: photoKeys })
      } else {
        await createPet({ ...data, photos: photoKeys })
      }
      router.push('/dashboard/mascotas')
    } catch (err: any) {
      setServerError(err.response?.data?.error || 'Error al guardar la mascota')
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* Fotos */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Fotos <span className="text-gray-400 font-normal">(máx. 8)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {photoDisplayUrls.map((url, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute inset-0 bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ))}
            {photoKeys.length < 8 && (
              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 cursor-pointer hover:border-primary-400 transition">
                {uploading ? '...' : '+'}
                <input type="file" accept="image/*" multiple className="sr-only" onChange={handlePhotoUpload} />
              </label>
            )}
          </div>
        </div>

        <Input label="Nombre *" placeholder="Ej: Luna" error={errors.name?.message} {...register('name')} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Especie *</label>
            <select className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500" {...register('species')}>
              <option value="dog">🐶 Perro</option>
              <option value="cat">🐱 Gato</option>
              <option value="other">🐾 Otro</option>
            </select>
          </div>
          <Input label="Raza" placeholder="Labrador, Siamés..." {...register('breed')} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Edad *</label>
            <select className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500" {...register('age')}>
              <option value="puppy">Cachorro</option>
              <option value="young">Joven</option>
              <option value="adult">Adulto</option>
              <option value="senior">Senior</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Tamaño *</label>
            <select className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500" {...register('size')}>
              <option value="small">Pequeño</option>
              <option value="medium">Mediano</option>
              <option value="large">Grande</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Sexo *</label>
            <select className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500" {...register('sex')}>
              <option value="female">Hembra ♀</option>
              <option value="male">Macho ♂</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Ciudad *" placeholder="Bogotá" error={errors.city?.message} {...register('city')} />
          <Input label="País *" placeholder="Colombia" error={errors.country?.message} {...register('country')} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Descripción *</label>
          <textarea rows={3} placeholder="Describe la personalidad y características de la mascota..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500 resize-none" {...register('description')} />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Historia (opcional)</label>
          <textarea rows={2} placeholder="¿Cómo llegó a la fundación? ¿Qué pasó antes?" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500 resize-none" {...register('story')} />
        </div>

        {/* Checkboxes */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Estado de salud y compatibilidad</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: 'vaccinated', label: '💉 Vacunado' },
              { name: 'sterilized', label: '✂️ Esterilizado' },
              { name: 'dewormed', label: '💊 Desparasitado' },
              { name: 'compatibleWithKids', label: '👶 Compatible con niños' },
              { name: 'compatibleWithPets', label: '🐾 Compatible con mascotas' },
              { name: 'urgent', label: '🚨 Caso urgente' },
            ].map((cb) => (
              <label key={cb.name} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded accent-primary-600" {...register(cb.name as any)} />
                <span className="text-sm text-gray-700">{cb.label}</span>
              </label>
            ))}
          </div>
        </div>

        {serverError && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{serverError}</p>}

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1 rounded-full">
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting || uploading} className="flex-1 rounded-full">
            {pet ? 'Guardar cambios' : 'Publicar mascota'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
