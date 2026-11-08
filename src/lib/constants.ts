export const SITE_ORIGIN = "https://virtusway.com";

/** Relative path to the intermediate page that explains the booking and links to Microsoft Bookings. */
export const BOOKING_PATH = "/exploracion";

/** La puerta pública del sitio: la primera conversación de 20 minutos. */
export const TALK_PATH = "/hablemos";

/** Microsoft Bookings calendars, linked from the /hablemos, /exploracion and /25minutos pages. */
export const BOOKINGS_URLS = {
  hablar:
    "https://bookings.cloud.microsoft/bookwithme/user/48d235d03a08496b97d4b477ea665fbb@virtusway.com/meetingtype/GfuSyqbdJ0uGX6Wm9WEGRA2?anonymous",
  exploration:
    "https://outlook.office.com/bookwithme/user/48d235d03a08496b97d4b477ea665fbb@virtusway.com/meetingtype/l9E3R2UjHUaYl4B09FL6MQ2?anonymous",
  trial:
    "https://bookings.cloud.microsoft/bookwithme/user/48d235d03a08496b97d4b477ea665fbb@virtusway.com/meetingtype/hWKzwq_c6UmuE44eDgkTuA2?anonymous",
};

export const CONTACT_EMAIL = "coach@virtusway.com";
/** Canal de WhatsApp. **Vacío mientras el canal no exista:** si está vacío, el correo de la guía no lo menciona. */
export const WHATSAPP_CHANNEL_URL = "https://whatsapp.com/channel/0029Vb90im44dTnGeZRF0r3o";
/** Address Microsoft Bookings sends the confirmation from. */
export const BOOKINGS_SENDER_EMAIL = "mauricio.magni@virtusway.com";

export const SOCIAL_URLS = {
  website: "https://www.virtusway.com",
  instagram: "https://www.instagram.com/virtuswaycoach",
  linkedin: "https://www.linkedin.com/in/mauricio-magni-manchon",
};
