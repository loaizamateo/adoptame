<div align="center">
  <h1>🐾 Adoptame</h1>
  <p><strong>Plataforma open source de adopción animal para Latinoamérica</strong></p>
  <p>
    <a href="https://adoptame.app">Website</a> ·
    <a href="#-inicio-rápido">Contribuir</a> ·
    <a href="#-stack">Stack</a> ·
    <a href="#-donaciones">Donaciones</a>
  </p>
  <img alt="License MIT" src="https://img.shields.io/badge/license-MIT-purple">
  <img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen">
  <a href="https://opencollective.com/adoptame-latam"><img alt="Open Collective" src="https://img.shields.io/opencollective/all/adoptame-latam?color=purple&label=donaciones"></a>
</div>

---

## ¿Qué es Adoptame?

Adoptame conecta mascotas que buscan hogar con familias amorosas en toda Latinoamérica.
Es **completamente gratuito** para fundaciones y rescatistas, y open source para que la comunidad pueda mejorarlo.

## ✨ Features

- 🔍 Búsqueda con filtros (especie, tamaño, edad, ciudad, compatibilidad)
- 🏠 Panel de gestión para fundaciones y refugios
- 📋 Flujo completo de solicitud de adopción
- ❤️ Sistema de donaciones directas a fundaciones
- 📧 Notificaciones por email
- 🌎 Enfocado en LATAM (español, ciudades locales)
- 📊 SEO optimizado — cada mascota indexada en Google

## 🛠️ Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 (App Router) + TailwindCSS |
| Backend | Fastify + TypeScript |
| Base de datos | MongoDB Atlas |
| Monorepo | Turborepo |
| Storage | Backblaze B2 |
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

# Editar apps/api/.env con tu MONGODB_URI y JWT secrets
# (ver apps/api/.env.example para referencia)

# Poblar la base de datos con datos de prueba
npm run seed --workspace=apps/api

# Levantar en desarrollo
npm run dev
```

La app estará en:
- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001

### Con Docker

```bash
docker-compose up -d
npm run seed --workspace=apps/api
```

### 🌱 Credenciales de prueba (después del seed)

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Admin | admin@adoptame.app | Admin1234! |
| Fundación (Bogotá) | fundacion1@adoptame.app | Fund1234! |
| Fundación (Medellín) | fundacion2@adoptame.app | Fund1234! |
| Adoptante | adoptante@adoptame.app | User1234! |

El seed crea **10 mascotas** con fotos reales, **2 fundaciones verificadas** y **3 solicitudes de adopción** en distintos estados.

---

## 💜 Donaciones

Adoptame es gratuito para siempre para fundaciones y rescatistas. Si quieres ayudar a mantener la plataforma viva:

<a href="https://opencollective.com/adoptame-latam">
  <img src="https://opencollective.com/adoptame-latam/donate/button@2x.png?color=purple" width="200" alt="Donar a Adoptame" />
</a>

También puedes apoyar a través de [GitHub Sponsors](https://github.com/sponsors/loaizamateo).

> Las fundaciones publican sus propios métodos de donación en su perfil — el 100% va directamente a ellas.

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Lee el [CONTRIBUTING.md](CONTRIBUTING.md) para empezar.

1. Revisa los [issues abiertos](https://github.com/loaizamateo/adoptame/issues)
2. Fork el repo
3. Crea tu rama: `git checkout -b feat/mi-feature`
4. Commit: `git commit -m 'feat: agregar X'`
5. Push y abre un Pull Request

## 👥 Contribuidores

¡Gracias a todas las personas que hacen posible Adoptame! 🐾

[![Contributors](https://contrib.rocks/image?repo=loaizamateo/adoptame)](https://github.com/loaizamateo/adoptame/graphs/contributors)

*¿Quieres aparecer aquí? ¡Haz tu primer PR!*

## 📄 Licencia

MIT — úsalo, modifícalo, compártelo. Solo ayuda a más mascotas a encontrar hogar. 🐾
