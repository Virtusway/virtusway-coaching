import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { getDb } from "../../db/client";
import { leadMagnetRegistrations } from "../../db/schema";

export const prerender = false;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_PATTERN = /^[a-f0-9]{64}$/i;

function readField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function jsonMessage(message: string, status: number) {
  return Response.json({ message }, { status });
}

function redirectWithState(requestUrl: string, state: string) {
  const redirectUrl = new URL("/revocar-consentimiento", requestUrl);
  redirectUrl.searchParams.set("estado", state);
  return Response.redirect(redirectUrl, 303);
}

function redirectWithToken(requestUrl: string, token: string) {
  const redirectUrl = new URL("/revocar-consentimiento", requestUrl);
  redirectUrl.searchParams.set("token", token);
  return Response.redirect(redirectUrl, 303);
}

async function revokeByToken(token: string) {
  const now = new Date();
  return getDb()
    .update(leadMagnetRegistrations)
    .set({
      commercialConsent: false,
      consentRevokedAt: now,
      updatedAt: now,
    })
    .where(eq(leadMagnetRegistrations.unsubscribeToken, token))
    .returning({ id: leadMagnetRegistrations.id });
}

async function revokeByEmail(email: string) {
  const now = new Date();
  return getDb()
    .update(leadMagnetRegistrations)
    .set({
      commercialConsent: false,
      consentRevokedAt: now,
      updatedAt: now,
    })
    .where(eq(leadMagnetRegistrations.email, email))
    .returning({ id: leadMagnetRegistrations.id });
}

export const GET: APIRoute = async ({ request, url }) => {
  const token = (url.searchParams.get("token") ?? "").trim();

  if (!TOKEN_PATTERN.test(token)) {
    return redirectWithState(request.url, "enlace-no-valido");
  }

  return redirectWithToken(request.url, token);
};

export const POST: APIRoute = async ({ request }) => {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return jsonMessage("No se pudo procesar el formulario.", 400);
  }

  const token = readField(formData, "token");
  const email = readField(formData, "email").toLowerCase();

  if (token) {
    if (!TOKEN_PATTERN.test(token)) {
      return jsonMessage("El enlace de revocación no es válido.", 400);
    }

    try {
      const updatedRows = await revokeByToken(token);

      if (updatedRows.length === 0) {
        return jsonMessage("El enlace de revocación no es válido.", 404);
      }

      return jsonMessage(
        "Tu consentimiento comercial ha sido revocado correctamente.",
        200,
      );
    } catch (error) {
      console.error("Failed to revoke commercial consent by token.", error);
      return jsonMessage(
        "No pudimos procesar la revocación ahora mismo. Inténtalo de nuevo en unos minutos.",
        500,
      );
    }
  }

  if (!email) {
    return jsonMessage("El email es obligatorio.", 400);
  }

  if (!EMAIL_PATTERN.test(email)) {
    return jsonMessage("Introduce un email válido.", 400);
  }

  try {
    await revokeByEmail(email);
    return jsonMessage(
      "Si ese email estaba registrado, hemos retirado el consentimiento comercial asociado.",
      200,
    );
  } catch (error) {
    console.error("Failed to revoke commercial consent by email.", error);
    return jsonMessage(
      "No pudimos procesar la revocación ahora mismo. Inténtalo de nuevo en unos minutos.",
      500,
    );
  }
};
