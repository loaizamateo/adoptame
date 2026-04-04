'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { api } from '@/lib/api'

interface Props {
  value?: string        // key o URL actual
  onChange: (key: string) => void
  label?: string
}

export function LogoUpload({ value, onChange, label = 'Logo de la fundación' }: Props) {
  const [preview, setPreview] = useState<string>(value || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Solo se permiten imágenes'); return }
    if (file.size > 2 * 1024 * 1024) { setError('Máximo 2MB'); return }

    setError('')
    setLoading(true)

    // Preview inmediato
    const blobUrl = URL.createObjectURL(file)
    setPreview(blobUrl)

    try {
      const form = new FormData()
      form.append('file', file)
      const res = await api.post('/upload/image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const key = res.data.data.key || res.data.data.url
      onChange(key)
    } catch {
      setError('Error al subir la imagen. Intentá de nuevo.')
      setPreview(value || '')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center gap-4">
        {/* Preview */}
        <div
          onClick={() => inputRef.current?.click()}
          className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary-400 transition relative flex-shrink-0"
        >
          {loading ? (
            <span className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
          ) : preview ? (
            <Image
              src={preview}
              alt="Logo"
              fill
              className="object-cover rounded-2xl"
              sizes="80px"
              unoptimized={preview.startsWith('blob:')}
            />
          ) : (
            <span className="text-3xl">🏠</span>
          )}
        </div>

        {/* Texto + botón */}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-sm text-primary-600 font-medium hover:underline text-left"
          >
            {preview ? 'Cambiar logo' : 'Subir logo'}
          </button>
          <p className="text-xs text-gray-400">PNG, JPG · Máx 2MB · Recomendado 400×400px</p>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
    </div>
  )
}
