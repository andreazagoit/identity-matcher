import { createAuthClient } from "better-auth/react";
import { oauthProviderClient } from "@better-auth/oauth-provider/client";
import { passkeyClient } from "@better-auth/passkey/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4000",
  plugins: [oauthProviderClient(), passkeyClient()],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
