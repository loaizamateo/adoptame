export interface City {
  city: string
  country: string
  countryCode: string
}

export const LOCATIONS: City[] = [
  // Colombia
  { city: 'Bogotá', country: 'Colombia', countryCode: 'CO' },
  { city: 'Medellín', country: 'Colombia', countryCode: 'CO' },
  { city: 'Cali', country: 'Colombia', countryCode: 'CO' },
  { city: 'Barranquilla', country: 'Colombia', countryCode: 'CO' },
  { city: 'Cartagena', country: 'Colombia', countryCode: 'CO' },
  { city: 'Bucaramanga', country: 'Colombia', countryCode: 'CO' },
  { city: 'Pereira', country: 'Colombia', countryCode: 'CO' },
  { city: 'Manizales', country: 'Colombia', countryCode: 'CO' },
  { city: 'Santa Marta', country: 'Colombia', countryCode: 'CO' },
  { city: 'Ibagué', country: 'Colombia', countryCode: 'CO' },
  { city: 'Cúcuta', country: 'Colombia', countryCode: 'CO' },
  { city: 'Villavicencio', country: 'Colombia', countryCode: 'CO' },
  { city: 'Pasto', country: 'Colombia', countryCode: 'CO' },
  { city: 'Montería', country: 'Colombia', countryCode: 'CO' },
  { city: 'Armenia', country: 'Colombia', countryCode: 'CO' },
  { city: 'Neiva', country: 'Colombia', countryCode: 'CO' },
  { city: 'Popayán', country: 'Colombia', countryCode: 'CO' },
  { city: 'Sincelejo', country: 'Colombia', countryCode: 'CO' },
  { city: 'Tunja', country: 'Colombia', countryCode: 'CO' },
  { city: 'Valledupar', country: 'Colombia', countryCode: 'CO' },
  // México
  { city: 'Ciudad de México', country: 'México', countryCode: 'MX' },
  { city: 'Guadalajara', country: 'México', countryCode: 'MX' },
  { city: 'Monterrey', country: 'México', countryCode: 'MX' },
  { city: 'Puebla', country: 'México', countryCode: 'MX' },
  { city: 'Tijuana', country: 'México', countryCode: 'MX' },
  { city: 'León', country: 'México', countryCode: 'MX' },
  { city: 'Juárez', country: 'México', countryCode: 'MX' },
  { city: 'Zapopan', country: 'México', countryCode: 'MX' },
  { city: 'Mérida', country: 'México', countryCode: 'MX' },
  { city: 'San Luis Potosí', country: 'México', countryCode: 'MX' },
  { city: 'Querétaro', country: 'México', countryCode: 'MX' },
  { city: 'Cancún', country: 'México', countryCode: 'MX' },
  { city: 'Aguascalientes', country: 'México', countryCode: 'MX' },
  { city: 'Hermosillo', country: 'México', countryCode: 'MX' },
  { city: 'Morelia', country: 'México', countryCode: 'MX' },
  // Argentina
  { city: 'Buenos Aires', country: 'Argentina', countryCode: 'AR' },
  { city: 'Córdoba', country: 'Argentina', countryCode: 'AR' },
  { city: 'Rosario', country: 'Argentina', countryCode: 'AR' },
  { city: 'Mendoza', country: 'Argentina', countryCode: 'AR' },
  { city: 'La Plata', country: 'Argentina', countryCode: 'AR' },
  { city: 'San Miguel de Tucumán', country: 'Argentina', countryCode: 'AR' },
  { city: 'Mar del Plata', country: 'Argentina', countryCode: 'AR' },
  { city: 'Salta', country: 'Argentina', countryCode: 'AR' },
  { city: 'Santa Fe', country: 'Argentina', countryCode: 'AR' },
  { city: 'San Juan', country: 'Argentina', countryCode: 'AR' },
  // Chile
  { city: 'Santiago', country: 'Chile', countryCode: 'CL' },
  { city: 'Valparaíso', country: 'Chile', countryCode: 'CL' },
  { city: 'Concepción', country: 'Chile', countryCode: 'CL' },
  { city: 'Antofagasta', country: 'Chile', countryCode: 'CL' },
  { city: 'Viña del Mar', country: 'Chile', countryCode: 'CL' },
  { city: 'Temuco', country: 'Chile', countryCode: 'CL' },
  { city: 'Rancagua', country: 'Chile', countryCode: 'CL' },
  { city: 'Talca', country: 'Chile', countryCode: 'CL' },
  // Perú
  { city: 'Lima', country: 'Perú', countryCode: 'PE' },
  { city: 'Arequipa', country: 'Perú', countryCode: 'PE' },
  { city: 'Trujillo', country: 'Perú', countryCode: 'PE' },
  { city: 'Chiclayo', country: 'Perú', countryCode: 'PE' },
  { city: 'Piura', country: 'Perú', countryCode: 'PE' },
  { city: 'Cusco', country: 'Perú', countryCode: 'PE' },
  { city: 'Iquitos', country: 'Perú', countryCode: 'PE' },
  // Venezuela
  { city: 'Caracas', country: 'Venezuela', countryCode: 'VE' },
  { city: 'Maracaibo', country: 'Venezuela', countryCode: 'VE' },
  { city: 'Valencia', country: 'Venezuela', countryCode: 'VE' },
  { city: 'Barquisimeto', country: 'Venezuela', countryCode: 'VE' },
  { city: 'Maracay', country: 'Venezuela', countryCode: 'VE' },
  // Ecuador
  { city: 'Quito', country: 'Ecuador', countryCode: 'EC' },
  { city: 'Guayaquil', country: 'Ecuador', countryCode: 'EC' },
  { city: 'Cuenca', country: 'Ecuador', countryCode: 'EC' },
  { city: 'Ambato', country: 'Ecuador', countryCode: 'EC' },
  // Uruguay
  { city: 'Montevideo', country: 'Uruguay', countryCode: 'UY' },
  { city: 'Salto', country: 'Uruguay', countryCode: 'UY' },
  { city: 'Ciudad de la Costa', country: 'Uruguay', countryCode: 'UY' },
  // Bolivia
  { city: 'Santa Cruz de la Sierra', country: 'Bolivia', countryCode: 'BO' },
  { city: 'La Paz', country: 'Bolivia', countryCode: 'BO' },
  { city: 'Cochabamba', country: 'Bolivia', countryCode: 'BO' },
  // Paraguay
  { city: 'Asunción', country: 'Paraguay', countryCode: 'PY' },
  { city: 'Ciudad del Este', country: 'Paraguay', countryCode: 'PY' },
  // Costa Rica
  { city: 'San José', country: 'Costa Rica', countryCode: 'CR' },
  // Panamá
  { city: 'Ciudad de Panamá', country: 'Panamá', countryCode: 'PA' },
]

export const COUNTRIES = [...new Set(LOCATIONS.map(l => l.country))].sort()

export function getCitiesByCountry(country: string): City[] {
  return LOCATIONS.filter(l => l.country === country)
}

export function findLocation(city: string, country: string): City | undefined {
  return LOCATIONS.find(
    l => l.city.toLowerCase() === city.toLowerCase() && l.country.toLowerCase() === country.toLowerCase()
  )
}

export function isValidLocation(city: string, country: string): boolean {
  return !!findLocation(city, country)
}
