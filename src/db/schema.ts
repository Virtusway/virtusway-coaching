import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const leadMagnetRegistrations = pgTable("lead_magnet_registrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  commercialConsent: boolean("commercial_consent").notNull().default(false),
  consentGrantedAt: timestamp("consent_granted_at", {
    withTimezone: true,
  }),
  consentRevokedAt: timestamp("consent_revoked_at", {
    withTimezone: true,
  }),
  unsubscribeToken: text("unsubscribe_token").notNull().unique(),
  lastRequestedAt: timestamp("last_requested_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
