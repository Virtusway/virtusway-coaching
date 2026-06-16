import type { APIRoute } from "astro";
import { randomBytes } from "node:crypto";
import nodemailer from "nodemailer";
import { getDb } from "../../db/client";
import { leadMagnetRegistrations } from "../../db/schema";

export const prerender = false;

const DOWNLOAD_PATH = "/descargar-guia";
const REVOKE_CONSENT_PATH = "/revocar-consentimiento";
const EXPLORATION_URL = "https://virtusway.com/exploracion";
const SMTP_HOST = "smtp.office365.com";
const SMTP_PORT = 587;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function readCheckbox(formData: FormData, name: string) {
  const value = formData.get(name);
  return value === "on" || value === "true" || value === "yes" || value === "1";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function jsonMessage(message: string, status: number) {
  return Response.json({ message }, { status });
}

function createUnsubscribeToken() {
  return randomBytes(32).toString("hex");
}

async function registerLead(email: string, name: string) {
  const now = new Date();
  const [registration] = await getDb()
    .insert(leadMagnetRegistrations)
    .values({
      email,
      name: name || null,
      commercialConsent: true,
      consentGrantedAt: now,
      consentRevokedAt: null,
      unsubscribeToken: createUnsubscribeToken(),
      lastRequestedAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: leadMagnetRegistrations.email,
      set: {
        name: name || null,
        commercialConsent: true,
        consentGrantedAt: now,
        consentRevokedAt: null,
        lastRequestedAt: now,
        updatedAt: now,
      },
    })
    .returning({
      unsubscribeToken: leadMagnetRegistrations.unsubscribeToken,
    });

  if (!registration) {
    throw new Error("Lead registration was not persisted.");
  }

  return registration.unsubscribeToken;
}

function buildEmail({
  downloadUrl,
  revokeUrl,
}: {
  downloadUrl: string;
  revokeUrl: string;
}) {
  const safeDownloadUrl = escapeHtml(downloadUrl);
  const safeRevokeUrl = escapeHtml(revokeUrl);

  return {
    text:
      'Gracias por descargar "5 preguntas para conectar con tus valores y tomar decisiones con claridad".\n\n' +
      `Clica en este enlace ${downloadUrl} para descargar la guía.\n` +
      "Tómate el tiempo que necesites para reflexionar.\n\n" +
      "¿Quieres dar el siguiente paso?\n\n" +
      "Si después de trabajar las preguntas sientes que necesitas acompañamiento, te invito a una sesión de exploración gratuita de 45 minutos (sin compromiso). Hablamos, te escucho y decidimos juntos si un proceso de coaching tiene sentido para ti.\n\n" +
      `📅 ${EXPLORATION_URL}\n\n` +
      "Gracias por confiar en VirtusWay.\n\n" +
      "Mauricio Magni\n" +
      "Coach Integrativo – VirtusWay\n" +
      "www.virtusway.com\n" +
      "IG: @virtuswaycoach\n" +
      "LinkedIn: linkedin.com/in/mauricio-magni-manchon\n\n" +
      "Puedes retirar tu consentimiento para comunicaciones comerciales en cualquier momento desde este enlace:\n" +
      revokeUrl,
    html:
      '<p>Gracias por descargar <strong>"5 preguntas para conectar con tus valores y tomar decisiones con claridad"</strong>.</p>' +
      `<p>Clica en este enlace <a href="${safeDownloadUrl}">descargar la guía</a>.<br />Tómate el tiempo que necesites para reflexionar.</p>` +
      "<p><strong>¿Quieres dar el siguiente paso?</strong></p>" +
      "<p>Si después de trabajar las preguntas sientes que necesitas acompañamiento, te invito a una sesión de exploración gratuita de 45 minutos (sin compromiso). Hablamos, te escucho y decidimos juntos si un proceso de coaching tiene sentido para ti.</p>" +
      `<p>📅 <a href="${EXPLORATION_URL}">${EXPLORATION_URL}</a></p>` +
      "<p>Gracias por confiar en VirtusWay.</p>" +
      "<p>Mauricio Magni<br />" +
      "Coach Integrativo – VirtusWay<br />" +
      '<a href="https://www.virtusway.com">www.virtusway.com</a><br />' +
      'IG: <a href="https://www.instagram.com/virtuswaycoach">@virtuswaycoach</a><br />' +
      'LinkedIn: <a href="https://www.linkedin.com/in/mauricio-magni-manchon">linkedin.com/in/mauricio-magni-manchon</a></p>' +
      '<hr style="border:0;border-top:1px solid #d4e2eb;margin:24px 0;" />' +
      `<p style="color:#5c6468;font-size:13px;line-height:1.5;">Puedes retirar tu consentimiento para comunicaciones comerciales en cualquier momento desde <a href="${safeRevokeUrl}">este enlace</a>.</p>`,
  };
}

export const POST: APIRoute = async ({ request }) => {
  const emailUser = import.meta.env.EMAIL_USER;
  const emailPass = import.meta.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.error("Lead magnet email is missing EMAIL_USER or EMAIL_PASS.");
    return jsonMessage(
      "El servicio de envío no está disponible ahora mismo.",
      500,
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return jsonMessage("No se pudo procesar el formulario.", 400);
  }

  const name = readField(formData, "nombre");
  const email = readField(formData, "email").toLowerCase();
  const commercialConsent = readCheckbox(formData, "commercialConsent");

  if (!email) {
    return jsonMessage("El email es obligatorio.", 400);
  }

  if (!EMAIL_PATTERN.test(email)) {
    return jsonMessage("Introduce un email válido.", 400);
  }

  if (!commercialConsent) {
    return jsonMessage(
      "Para recibir la guía necesitamos tu consentimiento comercial explícito.",
      400,
    );
  }

  let unsubscribeToken: string;

  try {
    unsubscribeToken = await registerLead(email, name);
  } catch (error) {
    console.error("Failed to persist lead magnet registration.", error);
    return jsonMessage(
      "No pudimos registrar tu consentimiento ahora mismo. Inténtalo de nuevo en unos minutos.",
      500,
    );
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    requireTLS: true,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const downloadUrl = new URL(DOWNLOAD_PATH, request.url).toString();
  const revokeUrl = new URL(REVOKE_CONSENT_PATH, request.url);
  revokeUrl.searchParams.set("token", unsubscribeToken);
  const emailBody = buildEmail({
    downloadUrl,
    revokeUrl: revokeUrl.toString(),
  });

  try {
    await transporter.sendMail({
      from: `VirtusWay <${emailUser}>`,
      to: email,
      subject: "Tu guía gratuita de VirtusWay",
      text: emailBody.text,
      html: emailBody.html,
    });

    return jsonMessage(
      "Te hemos enviado un correo con el enlace de descarga. Revisa también spam o promociones por si acaso.",
      200,
    );
  } catch (error) {
    console.error("Failed to send lead magnet email.", error);
    return jsonMessage(
      "No se pudo enviar la guía ahora mismo. Inténtalo de nuevo en unos minutos.",
      500,
    );
  }
};
