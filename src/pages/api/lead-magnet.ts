import type { APIRoute } from "astro";
import { EMAIL_PASS, EMAIL_USER } from "astro:env/server";
import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import nodemailer from "nodemailer";
import { getDb } from "../../db/client";
import { leadMagnetRegistrations } from "../../db/schema";
import { EMAIL_PATTERN, jsonMessage, readField } from "../../lib/api-utils";
import { BOOKING_PATH, SITE_ORIGIN, SOCIAL_URLS } from "../../lib/constants";

export const prerender = false;

const DOWNLOAD_PATH = "/descargar-guia";
const REVOKE_CONSENT_PATH = "/revocar-consentimiento";
const EXPLORATION_URL = new URL(BOOKING_PATH, SITE_ORIGIN).toString();
const SMTP_HOST = "smtp.office365.com";
const SMTP_PORT = 587;

// Hidden field: real users never fill this in, bots filling every input do.
const HONEYPOT_FIELD = "sitio-web";
const THROTTLE_WINDOW_MS = 10 * 60 * 1000;

const ALREADY_SENT_MESSAGE =
  "Ya te hemos enviado la guía hace unos minutos. Revisa tu correo (también spam o promociones) antes de volver a intentarlo.";
const SUCCESS_MESSAGE =
  "Te hemos enviado un correo con el enlace de descarga. Revisa también spam o promociones por si acaso.";

function wantsJson(request: Request) {
  return request.headers.get("accept")?.includes("application/json") ?? false;
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

function createUnsubscribeToken() {
  return randomBytes(32).toString("hex");
}

async function findLastRequestedAt(email: string) {
  const [existing] = await getDb()
    .select({ lastRequestedAt: leadMagnetRegistrations.lastRequestedAt })
    .from(leadMagnetRegistrations)
    .where(eq(leadMagnetRegistrations.email, email))
    .limit(1);

  return existing?.lastRequestedAt;
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
      `${SOCIAL_URLS.website.replace("https://", "")}\n` +
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
      `<a href="${SOCIAL_URLS.website}">${SOCIAL_URLS.website.replace("https://", "")}</a><br />` +
      `IG: <a href="${SOCIAL_URLS.instagram}">@virtuswaycoach</a><br />` +
      `LinkedIn: <a href="${SOCIAL_URLS.linkedin}">linkedin.com/in/mauricio-magni-manchon</a></p>` +
      '<hr style="border:0;border-top:1px solid #d4e2eb;margin:24px 0;" />' +
      `<p style="color:#5c6468;font-size:13px;line-height:1.5;">Puedes retirar tu consentimiento para comunicaciones comerciales en cualquier momento desde <a href="${safeRevokeUrl}">este enlace</a>.</p>`,
  };
}

export const POST: APIRoute = async ({ request }) => {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return jsonMessage("No se pudo procesar el formulario.", 400);
  }

  const acceptsJson = wantsJson(request);
  const respond = (message: string, status: number) => {
    if (acceptsJson) {
      return jsonMessage(message, status);
    }

    const redirectUrl = new URL(
      status < 400 ? DOWNLOAD_PATH : "/#guia",
      SITE_ORIGIN,
    );
    return Response.redirect(redirectUrl, 303);
  };

  // Bots tend to fill every field, including ones hidden from real users.
  // Pretend success without sending anything so scripts don't retry smarter.
  if (readField(formData, HONEYPOT_FIELD)) {
    return respond(SUCCESS_MESSAGE, 200);
  }

  const name = readField(formData, "nombre");
  const email = readField(formData, "email").toLowerCase();
  const commercialConsent = readCheckbox(formData, "commercialConsent");

  if (!email) {
    return respond("El email es obligatorio.", 400);
  }

  if (!EMAIL_PATTERN.test(email)) {
    return respond("Introduce un email válido.", 400);
  }

  if (!commercialConsent) {
    return respond(
      "Para recibir la guía necesitamos tu consentimiento comercial explícito.",
      400,
    );
  }

  try {
    const lastRequestedAt = await findLastRequestedAt(email);
    if (
      lastRequestedAt &&
      Date.now() - lastRequestedAt.getTime() < THROTTLE_WINDOW_MS
    ) {
      return respond(ALREADY_SENT_MESSAGE, 200);
    }
  } catch (error) {
    console.error("Failed to check lead magnet throttle.", error);
    return respond(
      "No pudimos registrar tu consentimiento ahora mismo. Inténtalo de nuevo en unos minutos.",
      500,
    );
  }

  let unsubscribeToken: string;

  try {
    unsubscribeToken = await registerLead(email, name);
  } catch (error) {
    console.error("Failed to persist lead magnet registration.", error);
    return respond(
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
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  const downloadUrl = new URL(DOWNLOAD_PATH, SITE_ORIGIN).toString();
  const revokeUrl = new URL(REVOKE_CONSENT_PATH, SITE_ORIGIN);
  revokeUrl.searchParams.set("token", unsubscribeToken);
  const emailBody = buildEmail({
    downloadUrl,
    revokeUrl: revokeUrl.toString(),
  });

  try {
    await transporter.sendMail({
      from: `VirtusWay <${EMAIL_USER}>`,
      to: email,
      subject: "Tu guía gratuita de VirtusWay",
      text: emailBody.text,
      html: emailBody.html,
    });

    return respond(SUCCESS_MESSAGE, 200);
  } catch (error) {
    console.error("Failed to send lead magnet email.", error);
    return respond(
      "No se pudo enviar la guía ahora mismo. Inténtalo de nuevo en unos minutos.",
      500,
    );
  }
};
