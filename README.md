<div align="center">
  <h1>🐾 Adoptame</h1>
  <p><strong>Plataforma open source de adopción animal para Latinoamérica</strong></p>
  <p>
    <a href="https://adoptame.app">Website</a> ·
    <a href="#-inicio-rápido">Contribuir</a> ·
    <a href="#-stack">Stack</a>
  </p>
  <img alt="License MIT" src="https://img.shields.io/badge/license-MIT-purple">
  <img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen">
</div>

---

## ¿Qué es Adoptame?

Adoptame conecta mascotas que buscan hogar con familias amorosas en toda Latinoamérica.
Es completamente gratuito para fundaciones y rescatistas, y open source para que la comunidad pueda mejorarla.

## ✨ Features

- 🔍 Búsqueda con filtros (especie, tamaño, edad, ciudad, compatibilidad)
- 🏠 Panel de gestión para fundaciones y refugios
- 📋 Flujo completo de solicitud de adopción
- 🗺️ Mapa de mascotas por ciudad
- ❤️ Hogares de paso y voluntariado
- 📧 Notificaciones por email
- 🌎 Enfocado en LATAM (español, ciudades locales)

## 🛠️ Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 (App Router) + TailwindCSS + shadcn/ui |
| Backend | Fastify + TypeScript |
| Base de datos | MongoDB Atlas |
| Monorepo | Turborepo |
| Storage | Cloudflare R2 |
| Deploy | Vercel + Railway |

## 🚀 Inicio rápido

### Requisitos
- Node.js >= 20
- npm >= 10
- Una cuenta en [MongoDB Atlas](https://mongodb.com/atlas) (tier gratuito)

### Instalación

```bash
# Clonar el repo
git clone https://github.com/loaizamateo/adoptame.git
cd adoptame

# Instalar dependencias
npm install

# Copiar variables de entorno
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Editar los .env con tus credenciales
# Al menos: MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET

# Levantar en desarrollo
npm run dev
```

La app estará en:
- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001
- **Health:** http://localhost:3001/health

### Con Docker

```bash
docker-compose up -d
```

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Lee el [CONTRIBUTING.md](CONTRIBUTING.md) para empezar.

1. Fork el repo
2. Crea tu rama: `git checkout -b feat/mi-feature`
3. Commit: `git commit -m 'feat: agregar X'`
4. Push: `git push origin feat/mi-feature`
5. Abre un Pull Request

## 📄 Licencia

MIT — úsalo, modifícalo, compártelo. Solo ayuda a más mascotas a encontrar hogar. 🐾
