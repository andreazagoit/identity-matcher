import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt } from "better-auth/plugins/jwt";
import { oauthProvider } from "@better-auth/oauth-provider";
import { apiKey } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";
import * as schema from "./schema";

/**
 * Identity Matcher - OAuth 2.1 Provider
 *
 * This server acts as the central identity/auth provider for the
 * Matcher ecosystem. Spaces (apps/communities) authenticate their
 * users through this OAuth 2.1 provider.
 *
 * Supported scopes:
 *   - openid: OpenID Connect identity
 *   - profile: Basic profile info (name, birthDate, gender)
 *   - email: Email address
 *   - offline_access: Refresh tokens
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  basePath: "/api/auth",

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: true,
        input: true,
      },
      lastName: {
        type: "string",
        required: true,
        input: true,
      },
      birthDate: {
        type: "string",
        required: true,
        input: true,
      },
      gender: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },

  session: {
    expiresIn: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // 1 day
    storeSessionInDatabase: true,
  },

  plugins: [
    jwt(),
    oauthProvider({
      loginPage: "/oauth2/sign-in",
      consentPage: "/oauth2/consent",
      accessTokenExpiresIn: 3600, // 1 hour
      refreshTokenExpiresIn: 30 * 24 * 60 * 60, // 30 days
      // Scopes supported by this OAuth server
      scopes: ["openid", "profile", "email", "offline_access"],
    }),
    apiKey(),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
