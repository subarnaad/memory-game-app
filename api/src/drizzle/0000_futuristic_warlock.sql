CREATE TABLE "black-listed-token" (
	"token" varchar PRIMARY KEY NOT NULL,
	"expiry" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar NOT NULL,
	"resetToken" text,
	"resetTokenExpiry" timestamp,
	"nameUpdateAt" timestamp,
	"phoneNumber" bigint NOT NULL,
	"gender" varchar,
	"avatar" varchar,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_phoneNumber_unique" UNIQUE("phoneNumber")
);
