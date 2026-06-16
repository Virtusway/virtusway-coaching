CREATE TABLE "lead_magnet_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"commercial_consent" boolean DEFAULT false NOT NULL,
	"consent_granted_at" timestamp with time zone,
	"consent_revoked_at" timestamp with time zone,
	"unsubscribe_token" text NOT NULL,
	"last_requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lead_magnet_registrations_email_unique" UNIQUE("email"),
	CONSTRAINT "lead_magnet_registrations_unsubscribe_token_unique" UNIQUE("unsubscribe_token")
);
