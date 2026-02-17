import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt } from "better-auth/plugins/jwt";
import { emailOTP } from "better-auth/plugins";
import { oauthProvider } from "@better-auth/oauth-provider";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";
import * as schema from "./schema";
import { sendOTPEmail } from "./email";

export const AUTH_SECRET =
  process.env.BETTER_AUTH_SECRET ||
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET;

/**
 * Identity Matcher - OAuth 2.1 Provider
 *
 * This server acts as the central identity/auth provider for the
 * Matcher ecosystem. Spaces (apps/communities) authenticate their
 * users through this OAuth 2.1 provider.
 *
 * Supported scopes:
 *   - openid: OpenID Connect identity
 *   - profile: Basic profile info (name, birthdate, gender)
 *   - email: Email address
 *   - offline_access: Refresh tokens
 */
export const auth = betterAuth({
  secret: AUTH_SECRET,
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  basePath: "/api/auth",

  advanced: {
    // Use a distinct cookie prefix so identitymatcher's session cookie
    // doesn't collide with client apps on the same domain (e.g. localhost).
    cookiePrefix: "idm",
  },

  user: {
    deleteUser: {
      enabled: true,
    },
    additionalFields: {
      givenName: {
        type: "string",
        required: true,
        input: true,
      },
      familyName: {
        type: "string",
        required: true,
        input: true,
      },
      birthdate: {
        type: "string",
        required: true,
        input: true,
      },
      gender: {
        type: "string",
        required: true,
        input: true,
      },
      locationUpdatedAt: {
        type: "date",
        required: false,
        input: false,
      },
    },
  },

  session: {
    expiresIn: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // 1 day
    storeSessionInDatabase: true,
  },

  emailAndPassword: {
    enabled: true,
  },

  plugins: [
    jwt({
      jwt: {
        expirationTime: "1h",
      },
    }),
    oauthProvider({
      loginPage: "/oauth2/sign-in",
      consentPage: "/oauth2/consent",
      accessTokenExpiresIn: 3600, // 1 hour
      refreshTokenExpiresIn: 30 * 24 * 60 * 60, // 30 days
      scopes: ["openid", "profile", "email", "offline_access", "location"],
      silenceWarnings: {
        oauthAuthServerConfig: true,
        openidConfig: true,
      },
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        await sendOTPEmail(email, otp, type);
      },
      otpLength: 6,
      expiresIn: 300, // 5 minutes
      disableSignUp: true, // signup handled separately (needs profile fields)
    }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
