import type { APIRoute } from "astro";
import nodemailer from "nodemailer";
import { getDb } from "../../db/client";
import { projectFeedbacks } from "../../db/schema";

export const prerender = false;

const SMTP_HOST = "smtp.office365.com";
const SMTP_PORT = 587;
const NOTIFICATION_EMAIL = "diandresmatino@gmail.com";

function jsonMessage(message: string, status: number) {
  return Response.json({ message }, { status });
}

export const POST: APIRoute = async ({ request }) => {
  const emailUser = import.meta.env.EMAIL_USER;
  const emailPass = import.meta.env.EMAIL_PASS;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return jsonMessage("No se pudo procesar la solicitud.", 400);
  }

  const { status, comment } = body;

  if (!status || !comment) {
    return jsonMessage("El estado y el comentario son obligatorios.", 400);
  }

  // 1. Try to persist in DB
  let dbPersisted = false;
  try {
    const db = getDb();
    await db.insert(projectFeedbacks).values({
      status,
      comment,
    });
    dbPersisted = true;
  } catch (error) {
    console.warn("Could not save feedback to Neon DB (DATABASE_URL may be missing or blocked in preview).", error);
  }

  // 2. Try to send Email notification
  if (!emailUser || !emailPass) {
    console.error("Missing SMTP credentials for feedback notification.");
    if (dbPersisted) {
      return jsonMessage(
        "Feedback registrado en base de datos, pero no se pudo enviar la notificación por email.",
        200
      );
    }
    return jsonMessage(
      "No se pudo guardar el feedback (base de datos desconectada y servicio SMTP no configurado).",
      500
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

  const statusLabel = status === "approved" ? "APROBADO (OK) ✔" : "CON OBSERVACIONES ⚠";
  
  const textBody = 
    `Mauricio Magni ha enviado feedback sobre el sitio web.\n\n` +
    `Estado: ${statusLabel}\n` +
    `Comentario:\n` +
    `----------------------------------------\n` +
    `${comment}\n` +
    `----------------------------------------\n\n` +
    `Guardado en Base de Datos: ${dbPersisted ? "Sí" : "No (DATABASE_URL no disponible en vista previa)"}\n`;

  const htmlBody = 
    `<p><strong>Mauricio Magni</strong> ha enviado feedback sobre el sitio web.</p>` +
    `<p><strong>Estado:</strong> <span style="font-size: 16px; color: ${status === "approved" ? "#00c397" : "#e05353"}; font-weight: bold;">${statusLabel}</span></p>` +
    `<p><strong>Comentario:</strong></p>` +
    `<div style="background: #f4f7f9; border-left: 4px solid #0a4d7a; padding: 16px; margin: 16px 0; font-family: monospace; white-space: pre-wrap;">${comment}</div>` +
    `<hr style="border: 0; border-top: 1px solid #d4e2eb; margin: 24px 0;" />` +
    `<p style="color: #5c6468; font-size: 13px;">Registrado en Neon DB: <strong>${dbPersisted ? "Sí" : "No (DATABASE_URL no disponible en vista previa)"}</strong></p>`;

  try {
    await transporter.sendMail({
      from: `VirtusWay Feedback <${emailUser}>`,
      to: NOTIFICATION_EMAIL,
      subject: `[VirtusWay Feedback] Nueva opinión de Mauricio: ${status === "approved" ? "OK" : "Observaciones"}`,
      text: textBody,
      html: htmlBody,
    });

    return jsonMessage(
      "Tu feedback ha sido enviado con éxito a Andrés por correo y registrado en la base de datos.",
      200
    );
  } catch (error) {
    console.error("Failed to send feedback email.", error);
    if (dbPersisted) {
      return jsonMessage(
        "Feedback registrado en base de datos, pero falló el envío del correo de notificación.",
        200
      );
    }
    return jsonMessage(
      "No se pudo registrar ni enviar tu feedback. Inténtalo de nuevo.",
      500
    );
  }
};
