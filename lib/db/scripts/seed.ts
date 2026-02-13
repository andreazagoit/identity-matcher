import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../schema";
import { insertUser } from "../../models/users/operations";
import { insertClient } from "../../models/clients/operations";
import { insertAssessment } from "../../models/assessments/operations";
import { assembleProfile } from "../../models/assessments/assembler";
import { upsertProfile } from "../../models/profiles/operations";
import {
  QUESTIONS,
  SECTIONS,
  type Section,
} from "../../models/assessments/questions";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client, { schema });

/**
 * Seed script for Identity Matcher.
 * Creates:
 *  1. A "service admin" user (owner of both default OAuth clients)
 *  2. Two default OAuth clients:
 *     - Identity Matcher → the service's own
 *       web-app, lets users manage their account + create OAuth clients.
 *     - Demo App → sample client for testing the OAuth flow.
 *  3. Test users with completed assessments and profile embeddings.
 */

// ── Default OAuth Clients ──────────────────────────────────────────

const SERVICE_CLIENT = {
  id: "svc-client-id",
  clientId: "idm_service_client",
  clientSecret: "idm_service_secret_change_me_in_production",
  name: "Identity Matcher",
  redirectUris: ["http://localhost:4000/api/auth/callback/identitymatcher"],
} as const;

const DEMO_CLIENT = {
  id: "demo-client-id",
  clientId: "idm_demo_client",
  clientSecret: "idm_demo_secret_change_me_in_production",
  name: "Demo App",
  redirectUris: ["http://localhost:3000/api/auth/callback/identitymatcher"],
} as const;

// ── Seed Users ─────────────────────────────────────────────────────

const ADMIN_USER = {
  name: "Admin Service",
  firstName: "Admin",
  lastName: "Service",
  email: "admin@identitymatcher.local",
  birthDate: "1990-01-01",
  gender: "man",
};

const SEED_USERS = [
  {
    name: "Mario Rossi",
    firstName: "Mario",
    lastName: "Rossi",
    email: "mario.rossi@example.com",
    birthDate: "1995-03-15",
    gender: "man",
  },
  {
    name: "Laura Bianchi",
    firstName: "Laura",
    lastName: "Bianchi",
    email: "laura.bianchi@example.com",
    birthDate: "1998-07-22",
    gender: "woman",
  },
  {
    name: "Alessandro Verdi",
    firstName: "Alessandro",
    lastName: "Verdi",
    email: "alessandro.verdi@example.com",
    birthDate: "1992-11-08",
    gender: "man",
  },
  {
    name: "Giulia Neri",
    firstName: "Giulia",
    lastName: "Neri",
    email: "giulia.neri@example.com",
    birthDate: "1996-05-30",
    gender: "woman",
  },
  {
    name: "Marco Ferrari",
    firstName: "Marco",
    lastName: "Ferrari",
    email: "marco.ferrari@example.com",
    birthDate: "1994-01-20",
    gender: "man",
  },
  {
    name: "Sofia Romano",
    firstName: "Sofia",
    lastName: "Romano",
    email: "sofia.romano@example.com",
    birthDate: "1997-09-12",
    gender: "woman",
  },
  {
    name: "Luca Colombo",
    firstName: "Luca",
    lastName: "Colombo",
    email: "luca.colombo@example.com",
    birthDate: "1993-06-25",
    gender: "man",
  },
  {
    name: "Emma Ricci",
    firstName: "Emma",
    lastName: "Ricci",
    email: "emma.ricci@example.com",
    birthDate: "1999-02-14",
    gender: "woman",
  },
  {
    name: "Andrea Marino",
    firstName: "Andrea",
    lastName: "Marino",
    email: "andrea.marino@example.com",
    birthDate: "1991-12-03",
    gender: "man",
  },
  {
    name: "Chiara Greco",
    firstName: "Chiara",
    lastName: "Greco",
    email: "chiara.greco@example.com",
    birthDate: "1996-08-18",
    gender: "woman",
  },
];

const OPEN_ANSWERS: Record<string, string[]> = {
  "psy-open": [
    "Sono una persona curiosa e riflessiva, mi piace ascoltare gli altri",
    "Mi considero empatico/a e attento/a ai dettagli",
    "Sono spontaneo/a e mi piace vivere il momento",
    "Mi definisco una persona calma e razionale",
    "Sono creativo/a e sempre alla ricerca di nuove idee",
  ],
  "val-open": [
    "Cerco sempre di essere autentico/a e fedele a me stesso/a",
    "L'onestà e il rispetto sono fondamentali per me",
    "Credo nell'equilibrio tra lavoro e vita personale",
    "La famiglia e gli affetti sono la mia priorità",
    "Voglio fare la differenza e aiutare gli altri",
  ],
  "int-open": [
    "Amo la natura, il trekking e la fotografia",
    "Mi appassiona la musica, suono la chitarra da anni",
    "Adoro viaggiare e scoprire nuove culture",
    "Mi piace cucinare e sperimentare ricette nuove",
    "Sono appassionato/a di cinema e serie TV",
  ],
  "beh-open": [
    "All'inizio sono riservato/a ma poi mi apro molto",
    "Mi piace costruire connessioni profonde gradualmente",
    "Sono diretto/a e apprezzo chi lo è con me",
    "Preferisco poche relazioni ma significative",
    "Sono molto affettuoso/a quando mi sento a mio agio",
  ],
};

function generateRandomAnswers(): Record<string, number | string> {
  const answers: Record<string, number | string> = {};

  for (const section of SECTIONS) {
    for (const question of QUESTIONS[section as Section]) {
      if (question.type === "closed") {
        answers[question.id] = Math.floor(Math.random() * 5) + 1;
      } else {
        const openOptions = OPEN_ANSWERS[question.id] || [""];
        answers[question.id] =
          openOptions[Math.floor(Math.random() * openOptions.length)];
      }
    }
  }

  return answers;
}

async function seed() {
  console.log("🌱 Seeding Identity Matcher database...\n");

  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY is required for embedding generation");
    process.exit(1);
  }

  try {
    // ── 1. Create admin user (owner of default OAuth clients) ──
    console.log("👤 Creating admin user...");
    const adminUser = await insertUser(db, {
      ...ADMIN_USER,
      emailVerified: true,
    });
    console.log(`  ✓ Admin: ${ADMIN_USER.email}`);

    // ── 2. Create default OAuth clients ──
    console.log("\n🔑 Creating default OAuth clients...");

    await insertClient(db, {
      ...SERVICE_CLIENT,
      userId: adminUser.id,
    });
    console.log(`  ✓ Service client: ${SERVICE_CLIENT.name}`);
    console.log(`    Client ID: ${SERVICE_CLIENT.clientId}`);
    console.log(`    Redirect:  ${SERVICE_CLIENT.redirectUris[0]}`);

    await insertClient(db, {
      ...DEMO_CLIENT,
      userId: adminUser.id,
    });
    console.log(`  ✓ Demo client:    ${DEMO_CLIENT.name}`);
    console.log(`    Client ID: ${DEMO_CLIENT.clientId}`);
    console.log(`    Redirect:  ${DEMO_CLIENT.redirectUris[0]}`);

    // ── 3. Create test users with assessments + profiles ──
    console.log(
      `\n📦 Creating ${SEED_USERS.length} test users with embeddings...`,
    );

    for (let i = 0; i < SEED_USERS.length; i++) {
      const userData = SEED_USERS[i];

      // Create user
      const user = await insertUser(db, userData);

      // Generate random assessment answers
      const answers = generateRandomAnswers();

      // Save assessment
      await insertAssessment(db, { userId: user.id, answers });

      // Assemble profile text from answers & generate embeddings
      const profileData = assembleProfile(answers);
      await upsertProfile(db, user.id, profileData, 1);

      console.log(
        `  ✓ ${i + 1}/${SEED_USERS.length} - ${userData.firstName} ${userData.lastName}`,
      );
    }

    console.log("\n" + "═".repeat(50));
    console.log("✅ Seed completed!");
    console.log(`   • 1 admin user (${ADMIN_USER.email})`);
    console.log(`   • 2 OAuth clients (service + demo)`);
    console.log(
      `   • ${SEED_USERS.length} test users with assessments and profiles`,
    );
    console.log("═".repeat(50));
    console.log("\n📋 Default OAuth Clients:");
    console.log(
      `   Service:  clientId=${SERVICE_CLIENT.clientId}  secret=${SERVICE_CLIENT.clientSecret}`,
    );
    console.log(
      `   Demo:     clientId=${DEMO_CLIENT.clientId}  secret=${DEMO_CLIENT.clientSecret}`,
    );
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }

  await client.end();
  process.exit(0);
}

seed();
