import { useState, useEffect } from 'react'

export interface LocationState {
  city: string
  country: string
  loading: boolean
  detected: boolean
}

const STORAGE_KEY = 'adoptame_location'

export function useLocation() {
  const [location, setLocation] = useState<LocationState>({
    city: '',
    country: '',
    loading: true,
    detected: false,
  })

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setLocation({ ...parsed, loading: false, detected: true })
        return
      } catch {}
    }

    fetch('https://ipapi.co/json/')
      .then((r) => r.json())
      .then((data) => {
        const city = data.city || ''
        const country = data.country_name || ''
        const loc = { city, country, loading: false, detected: true }
        setLocation(loc)
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ city, country }))
      })
      .catch(() => {
        setLocation({ city: '', country: '', loading: false, detected: false })
      })
  }, [])

  const setManualLocation = (city: string, country: string) => {
    const loc = { city, country, loading: false, detected: true }
    setLocation(loc)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ city, country }))
  }

  const clearLocation = () => {
    localStorage.removeItem(STORAGE_KEY)
    setLocation({ city: '', country: '', loading: false, detected: false })
  }

  return { location, setManualLocation, clearLocation }
}
