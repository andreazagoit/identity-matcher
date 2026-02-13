import { auth } from "@/lib/auth";
import { oauthProviderAuthServerMetadata } from "@better-auth/oauth-provider";

const handler = oauthProviderAuthServerMetadata(auth);

export const GET = handler;
