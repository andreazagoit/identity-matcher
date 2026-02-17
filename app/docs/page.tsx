import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRightIcon,
  BookOpenIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  KeyIcon,
  NetworkIcon,
  ShieldCheckIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import {
  FadeIn,
  FadeUpItem,
  FadeUpStagger,
  GradientBlob,
} from "@/components/motion";
import { Container } from "@/components/container";

export const metadata: Metadata = {
  title: "Documentazione - Identity Matcher",
  description:
    "Guida completa per integrare Identity Matcher come provider OIDC in applicazioni Next.js con better-auth.",
};

/* ────────────────────────────── quick-link data ────────────────────────────── */

const quickLinks = [
  {
    icon: <ShieldCheckIcon className="h-5 w-5" />,
    title: "Quick Start",
    description:
      "Configura Identity Matcher come provider OAuth2/OIDC in 4 step.",
    href: "#quick-start",
  },
  {
    icon: <KeyIcon className="h-5 w-5" />,
    title: "Endpoint e scopes",
    description:
      "Discovery OIDC, authorize, token, userinfo e scopes disponibili.",
    href: "#endpoints",
  },
  {
    icon: <NetworkIcon className="h-5 w-5" />,
    title: "GraphQL API",
    description:
      "Interroga i match di compatibilità con Bearer token o API key.",
    href: "#graphql",
  },
  {
    icon: <TriangleAlertIcon className="h-5 w-5" />,
    title: "Troubleshooting",
    description: "Errori comuni e soluzioni rapide.",
    href: "#troubleshooting",
  },
];

/* ────────────────────────────────── page ────────────────────────────────── */

export default function DocsPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative isolate overflow-hidden py-20 sm:py-28">
        <GradientBlob className="-top-20 right-1/4 h-[480px] w-[480px] bg-chart-2/15" />

        <Container className="relative text-center">
          <FadeIn>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
              <BookOpenIcon className="h-3 w-3" />
              Documentazione
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5">
              Integra Identity Matcher
              <span className="block text-muted-foreground mt-1">
                nella tua app Next.js
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Guida passo-passo per utilizzare Identity Matcher come provider
              OIDC in un progetto Next.js con{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
                better-auth
              </code>
              . Discovery automatico, PKCE, consent e GraphQL API.
            </p>
            <div className="mt-7 flex justify-center">
              <Button asChild className="rounded-full">
                <Link
                  href="/.well-known/openid-configuration"
                  target="_blank"
                  className="gap-2"
                >
                  OIDC Discovery
                  <ExternalLinkIcon className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* ── Quick links ── */}
      <Container className="pb-16">
        <FadeUpStagger className="grid gap-4 sm:grid-cols-2">
          {quickLinks.map((item) => (
            <FadeUpItem key={item.title}>
              <Link
                href={item.href}
                className="block rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-6 h-full hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-base flex items-center gap-2">
                      {item.title}
                      <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            </FadeUpItem>
          ))}
        </FadeUpStagger>
      </Container>

      {/* ── Prerequisiti ── */}
      <section
        className="border-t border-border/50 bg-card/30 py-20 sm:py-24"
        id="prerequisites"
      >
        <Container>
          <SectionTitle
            kicker="Prerequisiti"
            title="Prima di iniziare"
            description="Cosa ti serve per integrare Identity Matcher nella tua applicazione."
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <PrerequisiteCard
              title="Account Identity Matcher"
              description="Registrati su Identity Matcher e crea un client OAuth dalla dashboard."
            />
            <PrerequisiteCard
              title="Progetto Next.js"
              description="Un'app Next.js (App Router consigliato) con un database configurato."
            />
            <PrerequisiteCard
              title="better-auth"
              description={
                <>
                  Installa{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
                    better-auth
                  </code>{" "}
                  nel tuo progetto con il plugin{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
                    genericOAuth
                  </code>
                  .
                </>
              }
            />
          </div>
        </Container>
      </section>

      {/* ── Quick Start ── */}
      <section className="py-20 sm:py-24" id="quick-start">
        <Container>
          <SectionTitle
            kicker="Quick Start"
            title="Integrazione in 4 step"
            description="Configura Identity Matcher come provider OIDC nella tua app Next.js con better-auth."
          />

          <div className="space-y-10">
            {/* Step 1 */}
            <Step number="1" title="Installa le dipendenze">
              <CodeBlock language="bash" filename="Terminal">
                {`npm install better-auth`}
              </CodeBlock>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Assicurati di avere anche un database supportato (PostgreSQL,
                MySQL, SQLite) e il relativo driver configurato.
              </p>
            </Step>

            {/* Step 2 */}
            <Step number="2" title="Configura le variabili ambiente">
              <CodeBlock language="bash" filename=".env.local">
                {`# URL del server Identity Matcher
IDENTITY_MATCHER_URL=${process.env.NEXT_PUBLIC_APP_URL}

# Credenziali OAuth (dalla dashboard Identity Matcher)
IDENTITY_MATCHER_CLIENT_ID=il-tuo-client-id
IDENTITY_MATCHER_CLIENT_SECRET=il-tuo-client-secret`}
              </CodeBlock>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Puoi trovare{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
                  CLIENT_ID
                </code>{" "}
                e{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
                  CLIENT_SECRET
                </code>{" "}
                nella sezione <strong>Integrazione</strong> del tuo client nella
                dashboard.
              </p>
            </Step>

            {/* Step 3 */}
            <Step number="3" title="Configura better-auth (server + client)">
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Crea il file di configurazione server-side. Il plugin{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
                  genericOAuth
                </code>{" "}
                legge automaticamente tutti gli endpoint dal discovery OIDC.
              </p>

              <CodeBlock language="typescript" filename="lib/auth.ts">
                {`import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";

const identityMatcherUrl = process.env.IDENTITY_MATCHER_URL!;

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
  basePath: "/api/auth",

  // ... database config, etc.

  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "identitymatcher",
          discoveryUrl: \`\${identityMatcherUrl}/.well-known/openid-configuration\`,
          clientId: process.env.IDENTITY_MATCHER_CLIENT_ID!,
          clientSecret: process.env.IDENTITY_MATCHER_CLIENT_SECRET!,
          pkce: true,
          prompt: "consent",
          scopes: ["openid", "profile", "email"],
        },
      ],
    }),
    nextCookies(),
  ],

  // Consigliato: abilita il linking automatico degli account
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["identitymatcher"],
    },
  },
});`}
              </CodeBlock>

              <div className="mt-4">
                <CodeBlock language="typescript" filename="lib/auth-client.ts">
                  {`import { createAuthClient } from "better-auth/react";
import { genericOAuthClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
  plugins: [genericOAuthClient()],
});

export const { signIn, signOut, useSession } = authClient;`}
                </CodeBlock>
              </div>

              <div className="mt-4">
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Esponi le API route di better-auth nel tuo progetto:
                </p>
                <CodeBlock language="typescript" filename="app/api/auth/[...all]/route.ts">
                  {`import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);`}
                </CodeBlock>
              </div>
            </Step>

            {/* Step 4 */}
            <Step number="4" title="Avvia il login">
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Chiama{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
                  signIn.oauth2()
                </code>{" "}
                per avviare il flusso OAuth2 con Identity Matcher. L&apos;utente
                verrà reindirizzato alla pagina di login/consenso e poi
                riportato alla tua app.
              </p>

              <CodeBlock language="tsx" filename="components/login-button.tsx">
                {`"use client";

import { signIn } from "@/lib/auth-client";

export function LoginButton() {
  return (
    <button
      onClick={() =>
        signIn.oauth2({
          providerId: "identitymatcher",
          callbackURL: "/dashboard", // dove tornare dopo il login
        })
      }
    >
      Accedi con Identity Matcher
    </button>
  );
}`}
              </CodeBlock>
            </Step>
          </div>
        </Container>
      </section>

      {/* ── Flusso OAuth2 ── */}
      <section
        className="border-t border-border/50 bg-card/30 py-20 sm:py-24"
        id="flow"
      >
        <Container>
          <SectionTitle
            kicker="Come funziona"
            title="Il flusso OAuth2 / OIDC"
            description="Cosa succede quando un utente clicca il pulsante di login."
          />

          <div className="space-y-3">
            <FlowStep
              number="1"
              title="Redirect ad authorize"
              description="better-auth costruisce l'URL di authorization con PKCE, scopes e state, e reindirizza l'utente a Identity Matcher."
            />
            <FlowStep
              number="2"
              title="Login e consenso"
              description="L'utente si autentica su Identity Matcher (o crea un account) e approva i permessi richiesti."
            />
            <FlowStep
              number="3"
              title="Callback con authorization code"
              description="Identity Matcher reindirizza l'utente alla tua app con un codice temporaneo nell'URL."
            />
            <FlowStep
              number="4"
              title="Scambio code → token"
              description="better-auth scambia il codice con access token e ID token tramite il token endpoint."
            />
            <FlowStep
              number="5"
              title="Sessione creata"
              description="L'utente è autenticato nella tua app. I dati del profilo OIDC vengono salvati nel database."
            />
          </div>
        </Container>
      </section>

      {/* ── Endpoint ── */}
      <section className="py-20 sm:py-24" id="endpoints">
        <Container>
          <SectionTitle
            kicker="Reference"
            title="Endpoint"
            description="Tutti gli endpoint sono esposti dal server Identity Matcher. Il discovery OIDC li fornisce automaticamente a better-auth."
          />

          <div className="space-y-4">
            <EndpointRow
              method="GET"
              path="/.well-known/openid-configuration"
              description="Discovery OIDC — contiene tutti gli URL necessari per il flusso OAuth2."
            />
            <EndpointRow
              method="GET"
              path="/api/auth/oauth2/authorize"
              description="Authorization endpoint — avvia il flusso di login."
            />
            <EndpointRow
              method="POST"
              path="/api/auth/token"
              description="Token endpoint — scambia authorization code con access/ID token."
            />
            <EndpointRow
              method="GET"
              path="/api/auth/userinfo"
              description="Userinfo — restituisce i dati utente in base agli scopes concessi."
            />
            <EndpointRow
              method="GET"
              path="/api/auth/jwks"
              description="JSON Web Key Set — chiavi pubbliche per validare i JWT."
            />
          </div>

          <div className="mt-12">
            <h3 className="text-lg font-semibold mb-4">Scopes disponibili</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <ScopeCard
                scope="openid"
                description="Obbligatorio. Abilita il flusso OIDC e restituisce un ID token con il subject dell'utente."
              />
              <ScopeCard
                scope="profile"
                description="Nome, cognome, data di nascita e genere dell'utente."
              />
              <ScopeCard
                scope="email"
                description="Indirizzo email dell'utente e stato di verifica."
              />
              <ScopeCard
                scope="location"
                description="Coordinate geografiche dell'utente (se condivise)."
              />
              <ScopeCard
                scope="offline_access"
                description="Rilascia un refresh token per mantenere la sessione attiva."
              />
            </div>
          </div>

          <div className="mt-10 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5">
            <h4 className="text-sm font-semibold mb-2">
              Esempio risposta userinfo
            </h4>
            <CodeBlock language="json" filename="GET /api/auth/userinfo">
              {`{
  "sub": "abc123",
  "name": "Mario Rossi",
  "given_name": "Mario",
  "family_name": "Rossi",
  "email": "mario@example.com",
  "email_verified": true,
  "birthdate": "1990-05-15",
  "gender": "male"
}`}
            </CodeBlock>
          </div>
        </Container>
      </section>

      {/* ── GraphQL ── */}
      <section
        className="border-t border-border/50 bg-card/30 py-20 sm:py-24"
        id="graphql"
      >
        <Container>
          <SectionTitle
            kicker="GraphQL"
            title="Matching API"
            description="Una volta autenticato l'utente, puoi interrogare i match di compatibilità tramite l'API GraphQL."
          />

          <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-semibold mb-1">Prova subito</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Esplora lo schema, testa query e mutation direttamente dal
                browser con Apollo Sandbox integrato.
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-full shrink-0">
              <Link href="/api/graphql" target="_blank" className="gap-2">
                Apri GraphQL Sandbox
                <ExternalLinkIcon className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="space-y-10">
            {/* ── Metodo 1: OAuth ── */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center rounded-md bg-chart-3/15 px-2.5 py-1 text-xs font-bold text-chart-3">
                  METODO 1
                </span>
                <h3 className="text-base font-semibold">OAuth — Access Token</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Usa l&apos;access token ottenuto dal flusso OAuth2/OIDC. L&apos;utente è
                identificato automaticamente dal token (campo{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
                  sub
                </code>
                ). Le query disponibili sono{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
                  me
                </code>
                ,{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
                  profileStatus
                </code>
                ,{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
                  findMatches
                </code>
                .
              </p>
              <CodeBlock language="bash" filename="cURL — con Bearer token">
                {`curl -X POST ${process.env.NEXT_PUBLIC_APP_URL}/api/graphql \\
  -H "Authorization: Bearer <access_token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "{ me { id name email } findMatches(limit: 5) { user { name } score } }"
  }'`}
              </CodeBlock>
              <div className="mt-4">
                <CodeBlock language="graphql" filename="Esempio query OAuth">
                  {`# L'utente viene identificato dal token — non serve passare userId
query {
  me {
    id
    name
    email
  }
  profileStatus {
    completed
    completedAt
  }
  findMatches(limit: 10) {
    user {
      id
      name
      givenName
    }
    score
    breakdown {
      axis
      similarity
    }
  }
}`}
                </CodeBlock>
              </div>
            </div>

            {/* ── Metodo 2: API Key ── */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center rounded-md bg-chart-1/15 px-2.5 py-1 text-xs font-bold text-chart-1">
                  METODO 2
                </span>
                <h3 className="text-base font-semibold">
                  API Key — Server-to-Server
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Usa la API key generata dalla dashboard del client. A differenza
                di OAuth, devi passare esplicitamente{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
                  userId
                </code>{" "}
                come argomento. Le query disponibili sono{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
                  userProfileStatus
                </code>
                ,{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
                  userMatches
                </code>
                .
              </p>
              <CodeBlock language="bash" filename="cURL — con API key">
                {`# Puoi usare x-api-key header...
curl -X POST ${process.env.NEXT_PUBLIC_APP_URL}/api/graphql \\
  -H "x-api-key: <la-tua-api-key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "{ userMatches(userId: \\"abc123\\", limit: 5) { user { name } score } }"
  }'

# ...oppure Bearer token con la API key
curl -X POST ${process.env.NEXT_PUBLIC_APP_URL}/api/graphql \\
  -H "Authorization: Bearer <la-tua-api-key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "{ userMatches(userId: \\"abc123\\", limit: 5) { user { name } score } }"
  }'`}
              </CodeBlock>
              <div className="mt-4">
                <CodeBlock language="graphql" filename="Esempio query API Key">
                  {`# Con API key devi sempre specificare userId
query {
  userProfileStatus(userId: "abc123") {
    completed
    completedAt
  }
  userMatches(userId: "abc123", limit: 10) {
    user {
      id
      name
      givenName
    }
    score
    breakdown {
      axis
      similarity
    }
  }
}`}
                </CodeBlock>
              </div>
            </div>

            {/* ── Differenze ── */}
            <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-border/50 bg-muted/30">
                <h3 className="text-sm font-semibold">
                  OAuth vs API Key — Quando usare cosa
                </h3>
              </div>
              <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
                <div className="p-5 space-y-2">
                  <p className="text-sm font-medium text-chart-3">
                    OAuth (Access Token)
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    <li className="flex items-start gap-2">
                      <CheckCircle2Icon className="h-4 w-4 text-chart-3 shrink-0 mt-0.5" />
                      L&apos;utente è nel browser (frontend)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2Icon className="h-4 w-4 text-chart-3 shrink-0 mt-0.5" />
                      userId estratto automaticamente dal token
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2Icon className="h-4 w-4 text-chart-3 shrink-0 mt-0.5" />
                      Scade — sicuro per ambienti client-side
                    </li>
                  </ul>
                </div>
                <div className="p-5 space-y-2">
                  <p className="text-sm font-medium text-chart-1">
                    API Key
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    <li className="flex items-start gap-2">
                      <CheckCircle2Icon className="h-4 w-4 text-chart-1 shrink-0 mt-0.5" />
                      Chiamate server-to-server (backend)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2Icon className="h-4 w-4 text-chart-1 shrink-0 mt-0.5" />
                      Devi passare userId esplicitamente
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2Icon className="h-4 w-4 text-chart-1 shrink-0 mt-0.5" />
                      Non scade — usa solo lato server
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Troubleshooting ── */}
      <section className="py-20 sm:py-24" id="troubleshooting">
        <Container>
          <SectionTitle
            kicker="Troubleshooting"
            title="Errori comuni"
            description="I problemi più frequenti durante l'integrazione e come risolverli."
          />

          <div className="space-y-4">
            <TroubleshootItem
              title="account_not_linked"
              description="L'utente esiste già nel tuo database con un metodo di accesso diverso (es. email/password) e better-auth non sa come collegare il nuovo provider."
              fix={
                <>
                  Abilita{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
                    account.accountLinking.enabled
                  </code>{" "}
                  e aggiungi{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
                    {'"identitymatcher"'}
                  </code>{" "}
                  a{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
                    trustedProviders
                  </code>{" "}
                  nella configurazione di better-auth.
                </>
              }
            />
            <TroubleshootItem
              title="Redirect alla pagina sbagliata dopo login"
              description={
                <>
                  Dopo il login l&apos;utente torna alla homepage invece che
                  alla pagina desiderata.
                </>
              }
              fix={
                <>
                  Passa{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
                    callbackURL
                  </code>{" "}
                  in{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
                    signIn.oauth2()
                  </code>{" "}
                  e assicurati che il redirect URI sia registrato nel client
                  OAuth dalla dashboard Identity Matcher.
                </>
              }
            />
            <TroubleshootItem
              title="Discovery endpoint non trovato"
              description="better-auth non riesce a leggere la configurazione OIDC dal server."
              fix={
                <>
                  L&apos;endpoint corretto è{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
                    /.well-known/openid-configuration
                  </code>
                  . Non usare{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
                    /.well-known/oauth-authorization-server
                  </code>{" "}
                  che è un endpoint diverso.
                </>
              }
            />
            <TroubleshootItem
              title="PKCE code_verifier mancante"
              description="Il token endpoint rifiuta la richiesta perché manca il code_verifier."
              fix={
                <>
                  Assicurati di avere{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
                    pkce: true
                  </code>{" "}
                  nella configurazione del provider genericOAuth. better-auth
                  gestirà automaticamente la generazione e lo scambio del
                  code_verifier.
                </>
              }
            />
          </div>
        </Container>
      </section>
    </>
  );
}

/* ──────────────────────── Componenti locali ──────────────────────── */

function SectionTitle({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description?: string;
}) {
  return (
    <FadeIn>
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">
          {kicker}
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </FadeIn>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <FadeUpItem>
      <div className="flex gap-4">
        <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
          {number}
        </div>
        <div className="flex-1 space-y-4">
          <h3 className="font-semibold text-lg">{title}</h3>
          {children}
        </div>
      </div>
    </FadeUpItem>
  );
}

function FlowStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5">
      <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
        {number}
      </div>
      <div>
        <h4 className="font-semibold text-sm">{title}</h4>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

function EndpointRow({
  method,
  path,
  description,
}: {
  method: string;
  path: string;
  description: string;
}) {
  const methodColor =
    method === "GET"
      ? "bg-chart-3/15 text-chart-3"
      : "bg-chart-1/15 text-chart-1";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5">
      <div className="flex items-center gap-3 shrink-0">
        <span
          className={`inline-flex items-center rounded-md px-2 py-1 text-[11px] font-bold font-mono uppercase ${methodColor}`}
        >
          {method}
        </span>
        <code className="text-sm font-mono text-foreground">{path}</code>
      </div>
      <p className="text-sm text-muted-foreground sm:ml-auto">{description}</p>
    </div>
  );
}

function ScopeCard({
  scope,
  description,
}: {
  scope: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5">
      <code className="rounded bg-primary/10 px-2 py-1 text-xs font-mono font-semibold text-primary">
        {scope}
      </code>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function PrerequisiteCard({
  title,
  description,
}: {
  title: string;
  description: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5">
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle2Icon className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function TroubleshootItem({
  title,
  description,
  fix,
}: {
  title: string;
  description: React.ReactNode;
  fix: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5">
      <h3 className="font-semibold text-base mb-2">
        <code className="rounded bg-destructive/10 px-2 py-1 text-sm font-mono text-destructive">
          {title}
        </code>
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
      <div className="mt-3 rounded-lg bg-primary/5 border border-primary/10 p-3">
        <p className="text-sm leading-relaxed">
          <span className="text-primary font-medium">Soluzione:</span>{" "}
          <span className="text-muted-foreground">{fix}</span>
        </p>
      </div>
    </div>
  );
}
