# BACKLOG — Adoptame.app
> Plataforma open source de adopción animal para Latinoamérica

**Stack:** Next.js 15 (App Router) + Fastify + MongoDB Atlas + TailwindCSS + Turborepo  
**Repo:** https://github.com/loaizamateo/adoptame  
**Dominio:** adoptame.app  
**Deploy:** https://adoptame.app (Vercel) · https://api.adoptame.app (Railway)

---

## 🗺️ Épicas

| # | Épica | Estado |
|---|-------|--------|
| E-01 | Setup & Infraestructura | ✅ Completa |
| E-02 | Auth & Usuarios | ✅ Completa |
| E-03 | Fundaciones & Refugios | ✅ Completa |
| E-04 | Mascotas — CRUD & Publicación | ✅ Completa |
| E-05 | Búsqueda & Filtros | ✅ Completa (básico) |
| E-06 | Solicitudes de Adopción | ✅ Completa |
| E-07 | Panel de Fundación (Dashboard) | ✅ Completa |
| E-08 | Hogares de Paso & Voluntariado | ⬜ Pendiente |
| E-09 | Notificaciones & Email | ✅ Completa |
| E-10 | SEO & Performance | ✅ Completa |
| E-11 | Admin Global | ✅ Completa |
| E-12 | Open Source — Comunidad & Docs | ⬜ Pendiente |
| E-13 | Design System & Branding | ✅ Completa |
| E-14 | Deploy & DevOps | ✅ Completa |
| E-15 | Landing Marketplace | ✅ Completa |

---

## 🐛 Bugs conocidos / Mejoras pendientes

| ID | Descripción | Prioridad |
|----|-------------|-----------|
| B-01 | ~~Dashboard redirige a login por token expirado~~ | ✅ Resuelto |
| B-02 | ~~Fotos de mascotas no se guardaban (PATCH filtraba `photos`)~~ | ✅ Resuelto |
| B-03 | ~~Preview de imagen rota al editar mascota~~ | ✅ Resuelto |
| B-04 | ~~Imágenes de B2/Unsplash rotas (faltaban en `remotePatterns`)~~ | ✅ Resuelto |
| B-05 | ~~Dashboard mobile sin hamburguesa~~ | ✅ Resuelto |
| B-06 | ~~Tabla de mascotas sin scroll horizontal en mobile~~ | ✅ Resuelto |
| B-07 | ~~Axios no renovaba el access token al expirar (15 min)~~ | ✅ Resuelto |
| B-08 | Las fotos subidas expiran en 1h — considerar hacer el bucket público | Media |
| B-09 | ~~El dashboard muestra mascotas de todas las fundaciones si el user no tiene `foundationId`~~ | ✅ Resuelto |

---

## E-01 — Setup & Infraestructura ✅

- [x] Monorepo con Turborepo (`apps/web`, `apps/api`, `packages/schemas`, `packages/types`)
- [x] Next.js 15 + TailwindCSS en `apps/web`
- [x] Fastify + TypeScript + Mongoose en `apps/api`
- [x] Package `packages/schemas` con Zod schemas compartidos
- [x] Variables de entorno documentadas
- [x] Deploy: Vercel + Railway + MongoDB Atlas

---

## E-02 — Auth & Usuarios ✅

### Roles
- **Adoptante** — busca y solicita adopciones
- **Fundación** — publica y gestiona mascotas
- **Admin** — verifica fundaciones y modera la plataforma

### Tareas
- [x] Modelo `User` con roles
- [x] Registro + login JWT (access + refresh token — 15min/7d)
- [x] Refresh token automático en el cliente (interceptor Axios)
- [x] Guards de roles
- [x] Recuperación de contraseña (Resend)
- [x] Perfil de usuario

---

## E-03 — Fundaciones & Refugios ✅

- [x] Modelo `Foundation`
- [x] Flujo registro + aprobación por Admin
- [x] Perfil público `/fundaciones/[slug]`
- [x] Listado con filtros
- [x] Badge "Verificada"

---

## E-04 — Mascotas — CRUD & Publicación ✅

- [x] Modelo `Pet` completo
- [x] CRUD (solo Fundación owner)
- [x] Upload fotos (Backblaze B2 — bucket privado, URLs firmadas 1h)
- [x] Preview inmediato con blob URL al seleccionar imagen
- [x] Estados: disponible → en proceso → adoptado
- [x] Página pública `/mascotas/[id]`
- [x] Marcar como urgente
- [x] `photos` y `status` en Zod schema para que PATCH los acepte

---

## E-05 — Búsqueda & Filtros ✅ (básico)

- [x] Endpoint búsqueda con filtros + paginación
- [x] Índices MongoDB
- [x] Página `/adoptar` con filtros
- [x] Búsqueda por texto libre

### Pendiente
- [ ] **E05-T05** — Mapa de mascotas por ciudad (Leaflet.js)
- [ ] **E05-T06** — Favoritos (guardar mascotas)
- [ ] **E05-T07** — Alertas por email con filtros guardados

---

## E-06 — Solicitudes de Adopción ✅

- [x] Modelo `AdoptionRequest`
- [x] Formulario de solicitud
- [x] Flujo pendiente → revisión → aprobada/rechazada
- [x] Historial para adoptante y fundación

---

## E-07 — Panel de Fundación ✅

- [x] Dashboard `/dashboard` para rol Fundación
- [x] Autenticación robusta (leer localStorage directamente, sin depender de hidratación de Zustand)
- [x] Sidebar responsive: drawer hamburguesa en mobile, fijo en desktop
- [x] Tabla de mascotas con scroll horizontal en mobile
- [x] Gestión de mascotas: crear, editar, cambiar estado, eliminar
- [x] Gestión de solicitudes de adopción
- [x] Editar perfil de fundación

---

## E-08 — Hogares de Paso & Voluntariado ⬜

- [ ] Modelo `FosterHome`
- [ ] Registro como hogar de paso
- [ ] Fundación busca hogares disponibles
- [ ] Solicitud de acogida temporal
- [ ] Sección voluntariado

---

## E-09 — Notificaciones & Email ✅

- [x] Email service con Resend (fallback silencioso si no hay key)
- [x] Templates HTML con branding de Adoptame
- [x] Email a fundación al recibir nueva solicitud de adopción
- [x] Email a adoptante cuando cambia el estado de su solicitud
- [x] Reset password envía email real (PR #53)
- [x] Email de verificación a fundación cuando el admin la verifica
- [ ] Notificaciones in-app (badge + listado) — futuro
- [ ] Preferencias de notificación — futuro

---

## E-10 — SEO & Performance ✅

- [x] Metadata dinámica por mascota
- [x] Open Graph por mascota
- [x] Sitemap dinámico
- [x] Schema.org markup
- [x] Skeleton loaders

---

## E-11 — Admin Global ✅

- [x] Panel `/admin` con layout responsive (hamburguesa en mobile)
- [x] Estadísticas globales: fundaciones, verificadas, pendientes, mascotas, usuarios, adopciones
- [x] `/admin/fundaciones` — verificar/revocar con un click + email automático
- [x] `/admin/usuarios` — listado, suspender/activar
- [x] `/admin/mascotas` — vista global con filtro por estado

---

## E-12 — Open Source ⬜

- [ ] README completo con screenshots y GIF demo
- [ ] CONTRIBUTING.md con guía de setup local
- [ ] Issue/PR templates
- [ ] GitHub Projects público con este backlog
- [ ] Demo siempre actualizada con `main`

---

## E-13 — Design System & Branding ✅

- [x] Paleta: azul `#2563EB` (primary) + naranja `#F97316` (accent)
- [x] Tailwind tokens `primary`, `accent`, sombras `soft`/`card`
- [x] Componentes UI: `Button`, `Card`, `Input`
- [x] Logo con transparencia, versión ícono para navbar
- [x] `next.config.ts` con `remotePatterns` para Backblaze B2 y Unsplash

---

## E-14 — Deploy & DevOps ✅

- [x] Railway (API) — monorepo build con Turborepo
- [x] Vercel (Web) — `apps/web` como root directory
- [x] MongoDB Atlas M0
- [x] Backblaze B2 — bucket privado `adoptame-media`, URLs firmadas
- [x] Seed con datos de prueba

### Credenciales de prueba
| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@adoptame.app | Admin1234! |
| Fundación 1 | fundacion1@adoptame.app | Fund1234! |
| Fundación 2 | fundacion2@adoptame.app | Fund1234! |
| Adoptante | adoptante@adoptame.app | User1234! |

---

## E-15 — Landing Marketplace ✅

- [x] Grid de mascotas desde el primer scroll
- [x] Geolocalización por IP (`ipapi.co`) sin pedir permisos
- [x] `LocationPill` — ciudad detectada, permite cambiar
- [x] `MarketplaceFeed` — mascotas filtradas por ciudad con fallback a país
- [x] Filtros de especie: pills Todos / Perros / Gatos / Otros
- [x] Hero compacto con CTA

---

## 🧭 Decisiones de diseño

- **Sin multi-tenancy** — una sola DB, fundaciones por `foundationId`
- **MongoDB** — esquema flexible para mascotas y formularios
- **Open source first** — facilidad de contribución priorizada
- **Español primero** — i18n puede venir después, core es LATAM
- **Mobile first** — mayoría del tráfico en LATAM es mobile
- **Backblaze B2 privado** — cero costo de egress si se accede solo vía URLs firmadas
- **Zustand persist** — auth guardada en `adoptame-auth` (localStorage), key con `partialize` para excluir estado de hidratación

---

_Última actualización: 2026-04-03 (PR #52 /pets/mine, PR #53 admin + emails)_
