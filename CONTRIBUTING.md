# Guía de Contribución — Adoptame 🐾

¡Gracias por querer contribuir! Este proyecto existe para que más mascotas encuentren hogar en Latinoamérica.

---

## Índice

- [Código de conducta](#código-de-conducta)
- [¿Por dónde empiezo?](#por-dónde-empiezo)
- [Setup local](#setup-local)
- [Flujo de trabajo](#flujo-de-trabajo)
- [Convenciones](#convenciones)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Variables de entorno](#variables-de-entorno)
- [¿Dudas?](#dudas)

---

## Código de conducta

Este proyecto sigue el [Contributor Covenant](CODE_OF_CONDUCT.md). Al participar, aceptás tratarte con respeto con el resto de la comunidad.

---

## ¿Por dónde empiezo?

1. **Busca un issue** en [Issues](https://github.com/loaizamateo/adoptame/issues)
   - Los marcados con `good first issue` son ideales para empezar
   - Los marcados con `help wanted` necesitan colaboración activa
2. **Comenta** en el issue que querés trabajar (para que nadie lo repita)
3. **Fork + rama** y a codear 🚀

Si tenés una idea nueva, abre un issue primero para discutirla antes de implementar.

---

## Setup local

### Requisitos

| Herramienta | Versión mínima |
|-------------|----------------|
| Node.js     | 20+            |
| npm         | 10+            |

También necesitás una cuenta gratuita en [MongoDB Atlas](https://www.mongodb.com/atlas).

### Instalación

```bash
# 1. Fork el repo desde GitHub, luego clonalo
git clone https://github.com/TU_USUARIO/adoptame.git
cd adoptame

# 2. Agregar el remote upstream
git remote add upstream https://github.com/loaizamateo/adoptame.git

# 3. Instalar dependencias
npm install

# 4. Copiar y configurar variables de entorno
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# Editar apps/api/.env con tu MONGODB_URI y JWT secrets
```

### Seed (datos de prueba)

```bash
npm run seed --workspace=apps/api
```

Esto crea: 2 fundaciones verificadas, 1 admin, 1 adoptante, 10 mascotas y 3 solicitudes de adopción.

### Levantar en desarrollo

```bash
npm run dev
```

| Servicio  | URL                   |
|-----------|-----------------------|
| Frontend  | http://localhost:3000 |
| API       | http://localhost:3001 |

### Con Docker (opcional)

```bash
docker-compose up -d
npm run seed --workspace=apps/api
```

### Credenciales de prueba

| Rol         | Email                   | Contraseña |
|-------------|-------------------------|------------|
| Admin       | admin@adoptame.app      | Admin1234! |
| Fundación 1 | fundacion1@adoptame.app | Fund1234!  |
| Fundación 2 | fundacion2@adoptame.app | Fund1234!  |
| Adoptante   | adoptante@adoptame.app  | User1234!  |

---

## Flujo de trabajo

```
main
  └── feat/mi-feature
  └── fix/nombre-bug
  └── docs/mejorar-readme
```

1. **Sincronizá** tu fork antes de empezar:
   ```bash
   git fetch upstream && git checkout main && git merge upstream/main
   ```
2. **Creá tu rama** desde `main`:
   ```bash
   git checkout -b feat/nombre-descriptivo
   ```
3. **Hacé commits** pequeños y descriptivos
4. **Abrí el PR** contra `main` con descripción completa
5. **Respondé el review** — al menos 1 revisión antes de mergear

> ⚠️ No hacemos push directo a `main`. Todo entra por PR.

---

## Convenciones

### Commits (Conventional Commits)

```
feat:     nueva funcionalidad
fix:      corrección de bug
docs:     cambios en documentación
chore:    tareas de mantenimiento
refactor: refactor sin cambio funcional
test:     agregar o corregir tests
style:    formato, espacios (sin cambio lógico)
```

### Idioma

| Contexto             | Idioma  |
|----------------------|---------|
| Código (vars, funcs) | Inglés  |
| UI / textos de app   | Español |
| Issues y PRs         | Español |

### Estilo de código

- **TypeScript** estricto — sin `any` si se puede evitar
- **ESLint + Prettier** ya configurados → `npm run lint`
- **Zod** para validación — schemas compartidos en `packages/schemas`

---

## Estructura del proyecto

```
adoptame/
├── apps/
│   ├── web/              # Next.js 15 — Frontend (App Router)
│   │   ├── app/          # Páginas y layouts
│   │   ├── components/   # Componentes React
│   │   └── lib/          # Utils, hooks, store Zustand
│   └── api/              # Fastify — Backend
│       └── src/
│           ├── modules/  # Auth, pets, foundations, adoptions, admin…
│           ├── plugins/  # DB, auth, multipart…
│           └── shared/   # Middlewares, guards, helpers
├── packages/
│   ├── schemas/          # Zod schemas compartidos
│   └── types/            # TypeScript types compartidos
├── BACKLOG.md            # Roadmap y épicas
└── docker-compose.yml
```

---

## Variables de entorno

### `apps/api/.env`

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=cambia_esto
JWT_REFRESH_SECRET=cambia_esto_tambien
PORT=3001
FRONTEND_URL=http://localhost:3000

# Opcionales en desarrollo (la app funciona sin ellos)
RESEND_API_KEY=
B2_KEY_ID=
B2_APP_KEY=
B2_BUCKET_ID=
B2_BUCKET_NAME=
```

### `apps/web/.env`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

> Podés dejar vacías `RESEND_API_KEY` y las vars de B2 en desarrollo — la app funciona igual, solo sin emails reales ni subida de fotos.

---

## Antes de abrir un PR

- [ ] `npm run build` termina sin errores
- [ ] `npm run lint` no reporta warnings nuevos
- [ ] Probaste la funcionalidad manualmente con las credenciales de prueba

---

## ¿Dudas?

Abrí un issue con la etiqueta `question` 🙋 — toda pregunta es válida.

---

_¡Gracias por hacer que más mascotas encuentren hogar! 🐾_
