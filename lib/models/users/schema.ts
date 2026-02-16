import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  geometry,
} from "drizzle-orm/pg-core";

/**
 * User table — central identity record.
 *
 * Core better-auth fields + custom profile data.
 * Location is updated by client apps via GraphQL.
 */
export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),

    // Profile data (OIDC standard naming)
    givenName: text("given_name").notNull(),
    familyName: text("family_name").notNull(),
    birthdate: text("birthdate").notNull(),
    gender: text("gender").notNull(),

    // Geolocation (updated by client apps via GraphQL)
    location: geometry("location", { type: "point", mode: "xy", srid: 4326 }),
    locationUpdatedAt: timestamp("location_updated_at"),
  },
  (table) => [
    index("user_location_gist_idx").using("gist", table.location),
  ],
);

// ── Types ─────────────────────────────────────────────────────────

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

// Note: userRelations is defined in lib/schema.ts (barrel) to avoid
// circular dependencies with session, account, oauthClient, etc.

// Field name mapping (internal → OIDC claim):
//   givenName  → given_name
//   familyName → family_name
//   birthdate  → birthdate
//   gender     → gender
