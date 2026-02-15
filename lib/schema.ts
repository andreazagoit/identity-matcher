// Central barrel export for all Drizzle schemas.
// Required by lib/db.ts and lib/auth.ts (import * as schema).
// All tables and relations are defined in lib/models/*/schema.ts.

// 1. Users (base, no dependencies)
export * from "./models/users/schema";

// 2. Better-Auth core (session, account, verification, jwks)
export * from "./models/auth/schema";

// 3. OAuth Clients (client, tokens, consent)
export * from "./models/clients/schema";

// 4. Assessments
export * from "./models/assessments/schema";

// 5. Profiles (vector embeddings for matching)
export * from "./models/profiles/schema";
