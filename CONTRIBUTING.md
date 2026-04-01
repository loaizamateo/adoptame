# Guía de Contribución — Adoptame 🐾

¡Gracias por querer contribuir! Este proyecto existe para que más mascotas encuentren hogar.

## Proceso

1. Revisa los [issues abiertos](https://github.com/loaizamateo/adoptame/issues)
2. Comenta en el issue que quieres trabajar
3. Fork + rama con nombre descriptivo (`feat/X`, `fix/Y`, `docs/Z`)
4. Abre un PR con descripción clara
5. Espera review

## Convenciones

- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`)
- **Idioma del código:** Inglés (variables, funciones, comentarios técnicos)
- **Idioma de UI:** Español

## Setup local

Ver [README.md](README.md#-inicio-rápido)

## Estructura del proyecto

```
adoptame/
├── apps/
│   ├── web/     # Next.js 14 — Frontend
│   └── api/     # Fastify — Backend
├── packages/
│   ├── schemas/ # Zod schemas compartidos
│   └── types/   # TypeScript types compartidos
```

## ¿Dudas?

Abre un issue con la etiqueta `question`. 🙋
