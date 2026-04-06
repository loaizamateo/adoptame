import { env } from '../config/env'
import { logger } from '../config/logger'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  if (!env.RESEND_API_KEY) {
    logger.debug({ to, subject }, 'email: sin RESEND_API_KEY, omitiendo envío')
    return
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: env.RESEND_FROM_EMAIL, to, subject, html }),
  })
  if (!res.ok) {
    const err = await res.text()
    logger.error({ to, subject, status: res.status, body: err }, 'email: error al enviar')
  }
}

const base = (content: string) => `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Inter,sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
    <div style="background:#2563EB;padding:28px 32px;text-align:center">
      <span style="font-size:28px">🐾</span>
      <h1 style="color:#fff;margin:8px 0 0;font-size:20px;font-weight:700">Adoptame</h1>
    </div>
    <div style="padding:32px">${content}</div>
    <div style="background:#f9fafb;padding:16px 32px;text-align:center;font-size:12px;color:#9ca3af">
      © ${new Date().getFullYear()} Adoptame — Plataforma de adopción animal para LATAM
    </div>
  </div>
</body>
</html>`

export const emailTemplates = {
  adoptionRequestReceived: (foundation: string, petName: string, adopterName: string, dashboardUrl: string) => ({
    subject: `Nueva solicitud de adopción — ${petName}`,
    html: base(`
      <h2 style="color:#1f2937;margin:0 0 8px">Nueva solicitud de adopción 📋</h2>
      <p style="color:#6b7280;margin:0 0 24px">Hola <strong>${foundation}</strong>, tienes una nueva solicitud.</p>
      <div style="background:#eff6ff;border-radius:12px;padding:20px;margin-bottom:24px">
        <p style="margin:0;color:#1d4ed8"><strong>Mascota:</strong> ${petName}</p>
        <p style="margin:8px 0 0;color:#1d4ed8"><strong>Solicitante:</strong> ${adopterName}</p>
      </div>
      <a href="${dashboardUrl}" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600">Ver solicitud →</a>
    `),
  }),

  adoptionStatusChanged: (adopterName: string, petName: string, status: string, notes?: string) => {
    const statusMap: Record<string, { label: string; color: string; emoji: string; msg: string }> = {
      reviewing: { label: 'En revisión', color: '#2563eb', emoji: '🔍', msg: 'La fundación está revisando tu solicitud.' },
      approved:  { label: 'Aprobada',    color: '#16a34a', emoji: '✅', msg: '¡Tu solicitud fue aprobada! La fundación se pondrá en contacto contigo.' },
      rejected:  { label: 'Rechazada',   color: '#dc2626', emoji: '❌', msg: 'Tu solicitud no fue aprobada en esta ocasión.' },
      completed: { label: 'Completada',  color: '#7c3aed', emoji: '🎉', msg: `¡${petName} tiene un nuevo hogar! Gracias por adoptar.` },
    }
    const s = statusMap[status] ?? statusMap.reviewing
    return {
      subject: `Tu solicitud para ${petName} — ${s.label}`,
      html: base(`
        <h2 style="color:#1f2937;margin:0 0 8px">${s.emoji} ${s.label}</h2>
        <p style="color:#6b7280;margin:0 0 24px">Hola <strong>${adopterName}</strong>, hay novedades sobre tu solicitud.</p>
        <div style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:${notes ? '16px' : '24px'}">
          <p style="margin:0;color:#374151"><strong>Mascota:</strong> ${petName}</p>
          <p style="margin:8px 0 0;color:#374151"><strong>Estado:</strong> <span style="color:${s.color};font-weight:600">${s.label}</span></p>
        </div>
        ${notes ? `<div style="background:#fffbeb;border-radius:12px;padding:16px;margin-bottom:24px"><p style="margin:0;color:#92400e"><strong>Nota de la fundación:</strong><br>${notes}</p></div>` : ''}
        <p style="color:#6b7280">${s.msg}</p>
        <a href="${env.FRONTEND_URL}/mis-solicitudes" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600;margin-top:16px">Ver mis solicitudes →</a>
      `),
    }
  },

  resetPassword: (name: string, resetUrl: string) => ({
    subject: 'Restablecer contraseña — Adoptame',
    html: base(`
      <h2 style="color:#1f2937;margin:0 0 8px">Restablecer contraseña 🔑</h2>
      <p style="color:#6b7280;margin:0 0 24px">Hola <strong>${name}</strong>, recibimos una solicitud para restablecer tu contraseña. Este enlace expira en 1 hora.</p>
      <a href="${resetUrl}" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600">Restablecer contraseña →</a>
      <p style="color:#9ca3af;font-size:13px;margin-top:24px">Si no solicitaste esto, ignora este correo.</p>
    `),
  }),

  welcomeFoundation: (name: string) => ({
    subject: '¡Bienvenido a Adoptame! 🐾',
    html: base(`
      <h2 style="color:#1f2937;margin:0 0 8px">¡Hola, ${name}! 👋</h2>
      <p style="color:#6b7280;margin:0 0 24px">Tu fundación fue registrada en Adoptame. Pronto un administrador revisará tu perfil y lo verificará.</p>
      <p style="color:#6b7280;margin:0 0 24px">Mientras tanto, puedes empezar a publicar mascotas desde tu dashboard.</p>
      <a href="${env.FRONTEND_URL}/dashboard" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600">Ir al dashboard →</a>
    `),
  }),
}
