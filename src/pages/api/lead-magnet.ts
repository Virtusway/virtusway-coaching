import type { APIRoute } from "astro";
import nodemailer from "nodemailer";

export const prerender = false;

const GUIDE_FILENAME = "Guia_Valores_VirtusWay_Impresion.pdf";
const SMTP_HOST = "smtp.office365.com";
const SMTP_PORT = 587;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
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

export const POST: APIRoute = async ({ request }) => {
  const emailUser = import.meta.env.EMAIL_USER;
  const emailPass = import.meta.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.error("Lead magnet email is missing EMAIL_USER or EMAIL_PASS.");
    return jsonMessage(
      "El servicio de envio no esta disponible ahora mismo.",
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

  if (!email) {
    return jsonMessage("El email es obligatorio.", 400);
  }

  if (!EMAIL_PATTERN.test(email)) {
    return jsonMessage("Introduce un email valido.", 400);
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

  const guideUrl = new URL(`/${GUIDE_FILENAME}`, request.url).toString();
  const safeName = name ? ` ${escapeHtml(name)}` : "";
  const nameSuffix = name ? ` ${name}` : "";
  const greeting = `Hola${nameSuffix},\n\n`;

  try {
    await transporter.sendMail({
      from: `Virtusway <${emailUser}>`,
      to: email,
      subject: "Tu guía gratuita de Virtusway",
      text:
        greeting +
        "Gracias por solicitar la guía gratuita de Virtusway.\n" +
        'Te adjunto el PDF "5 preguntas para conectar con tus valores y tomar decisiones con claridad" para que puedas leerlo cuando quieras.\n\n' +
        "Si quieres responder a este correo, puedes escribir a coach@virtusway.com.\n\n" +
        "Un saludo,\nVirtusway",
      html:
        `<p>Hola${safeName},</p>` +
        "<p>Gracias por solicitar la guía gratuita de Virtusway.</p>" +
        '<p>Te adjunto el PDF <strong>"5 preguntas para conectar con tus valores y tomar decisiones con claridad"</strong> para que puedas leerlo cuando quieras.</p>' +
        '<p>Si quieres responder a este correo, puedes escribir a <a href="mailto:coach@virtusway.com">coach@virtusway.com</a>.</p>' +
        "<p>Un saludo,<br />Virtusway</p>",
      attachments: [
        {
          filename: GUIDE_FILENAME,
          path: guideUrl,
          contentType: "application/pdf",
        },
      ],
    });

    return jsonMessage(
      "La guía ya va de camino. Revisa también spam o promociones por si acaso.",
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
