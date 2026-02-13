import { auth } from "@/lib/auth";
import { oauthProviderOpenIdConfigMetadata } from "@better-auth/oauth-provider";

const handler = oauthProviderOpenIdConfigMetadata(auth);

export const GET = handler;
