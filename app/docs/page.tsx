import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BookOpenIcon,
  CodeIcon,
  KeyIcon,
  ShieldCheckIcon,
  BrainCircuitIcon,
  NetworkIcon,
  ArrowRightIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import {
  FadeIn,
  FadeUpStagger,
  FadeUpItem,
  HoverCard,
  GradientBlob,
} from "@/components/motion";
import { Container } from "@/components/container";

export const metadata: Metadata = {
  title: "Documentazione — Identity Matcher",
  description:
    "Guida completa all'integrazione di Identity Matcher: OAuth 2.1, PKCE, OpenID Connect, API GraphQL e AI Matching.",
};

// ---------------------------------------------------------------------------
// Sections data
// ---------------------------------------------------------------------------

const quickLinks = [
  {
    icon: <ShieldCheckIcon className="h-5 w-5" />,
    title: "Autenticazione OAuth 2.1",
    description: "Flusso Authorization Code + PKCE, token exchange e gestione sessioni.",
    href: "#oauth",
  },
  {
    icon: <KeyIcon className="h-5 w-5" />,
    title: "OpenID Connect",
    description: "Discovery, id_token, UserInfo endpoint e configurazione OIDC.",
    href: "#oidc",
  },
  {
    icon: <NetworkIcon className="h-5 w-5" />,
    title: "GraphQL API",
    description: "Query per matching, profili utente e gestione client.",
    href: "#graphql",
  },
  {
    icon: <BrainCircuitIcon className="h-5 w-5" />,
    title: "AI Matching",
    description: "Come funziona il questionario, gli embeddings e il calcolo di compatibilità.",
    href: "#matching",
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DocsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden py-24 sm:py-32">
        <GradientBlob className="-top-20 right-1/4 h-[500px] w-[500px] bg-chart-2/15" />

        <Container className="relative text-center">
          <FadeIn>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
              <BookOpenIcon className="h-3 w-3" />
              Documentazione
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5">
              Costruisci con{" "}
              <span className="bg-gradient-to-r from-primary via-chart-2 to-chart-1 bg-clip-text text-transparent">
                Identity Matcher
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Tutto quello che serve per integrare autenticazione OAuth 2.1 e
              AI matching nella tua applicazione.
            </p>
          </FadeIn>
        </Container>
      </section>

      {/* Quick links */}
      <Container className="pb-24">
        <FadeUpStagger className="grid gap-5 sm:grid-cols-2">
          {quickLinks.map((item) => (
            <HoverCard key={item.title}>
              <Link href={item.href} className="block">
                <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-7 h-full transition-colors hover:border-primary/30">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-start gap-4">
                    <div className="shrink-0 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                        {item.title}
                        <ArrowRightIcon className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </HoverCard>
          ))}
        </FadeUpStagger>
      </Container>

      {/* ── Quick Start ── */}
      <section className="border-t border-border/50 bg-card/30 py-24 sm:py-28" id="quickstart">
        <Container>
          <FadeIn>
            <div className="mb-12">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
                Quick Start
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Inizia in 5 minuti
              </h2>
            </div>
          </FadeIn>

          <FadeUpStagger className="space-y-10">
            {/* Step 1 */}
            <FadeUpItem>
              <div className="flex gap-4">
                <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-3">Crea un Client OAuth</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    Dalla <Link href="/dashboard" className="text-primary hover:underline">Dashboard</Link>,
                    crea un nuovo client. Otterrai <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">client_id</code>{" "}
                    e <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">client_secret</code>.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Aggiungi i redirect URI della tua app (es.{" "}
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                      https://tuaapp.com/api/auth/callback/identitymatcher
                    </code>
                    ).
                  </p>
                </div>
              </div>
            </FadeUpItem>

            {/* Step 2 */}
            <FadeUpItem>
              <div className="flex gap-4">
                <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-3">Configura OIDC Discovery</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    Punta il tuo framework al discovery URL:
                  </p>
                  <CodeBlock language="bash" filename="discovery">
{`# Discovery endpoint
GET /.well-known/openid-configuration

# Risponde con authorization_endpoint, token_endpoint,
# jwks_uri, userinfo_endpoint, etc.`}
                  </CodeBlock>
                  <div className="mt-3">
                    <Button variant="outline" size="sm" asChild className="gap-1.5 rounded-full">
                      <Link
                        href="/.well-known/openid-configuration"
                        target="_blank"
                      >
                        Vedi OIDC Discovery live
                        <ExternalLinkIcon className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </FadeUpItem>

            {/* Step 3 */}
            <FadeUpItem>
              <div className="flex gap-4">
                <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-3">Implementa il flusso auth</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    Esempio con <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">better-auth</code> (Next.js):
                  </p>
                  <CodeBlock language="typescript" filename="lib/auth.ts">
{`// lib/auth.ts
import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    genericOAuth({
      config: [{
        providerId: "identitymatcher",
        discoveryUrl: \`\${PROVIDER}/.well-known/openid-configuration\`,
        clientId: process.env.OAUTH_CLIENT_ID!,
        clientSecret: process.env.OAUTH_CLIENT_SECRET!,
        pkce: true,
        scopes: ["openid", "profile", "email"],
      }],
    }),
  ],
});`}
                  </CodeBlock>
                </div>
              </div>
            </FadeUpItem>

            {/* Step 4 */}
            <FadeUpItem>
              <div className="flex gap-4">
                <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-3">Usa l&apos;API GraphQL per i match</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    Una volta autenticati, puoi chiamare l&apos;API GraphQL per trovare utenti compatibili:
                  </p>
                  <CodeBlock language="graphql" filename="findMatches.gql">
{`query FindMatches {
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
            </FadeUpItem>
          </FadeUpStagger>
        </Container>
      </section>

      {/* ── OAuth 2.1 Reference ── */}
      <section className="py-24 sm:py-28" id="oauth">
        <Container>
          <FadeIn>
            <div className="mb-12">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
                Riferimento
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Endpoint OAuth 2.1
              </h2>
            </div>
          </FadeIn>

          <FadeUpStagger className="space-y-4">
            <EndpointRow
              method="GET"
              path="/api/auth/oauth2/authorize"
              description="Inizio flusso autorizzazione (Authorization Code + PKCE)"
            />
            <EndpointRow
              method="POST"
              path="/api/auth/token"
              description="Scambia authorization code per access/refresh token"
            />
            <EndpointRow
              method="GET"
              path="/api/auth/userinfo"
              description="Informazioni utente (richiede Bearer token)"
            />
            <EndpointRow
              method="GET"
              path="/api/auth/jwks"
              description="JSON Web Key Set per la verifica dei token"
            />
            <EndpointRow
              method="GET"
              path="/.well-known/openid-configuration"
              description="OIDC Discovery / server metadata"
            />
          </FadeUpStagger>
        </Container>
      </section>

      {/* ── Scopes ── */}
      <section className="border-t border-border/50 bg-card/30 py-24 sm:py-28" id="oidc">
        <Container>
          <FadeIn>
            <div className="mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Scopes disponibili
              </h2>
            </div>
          </FadeIn>

          <FadeUpStagger className="grid gap-4 sm:grid-cols-2">
            <ScopeCard scope="openid" description="Identità base OpenID Connect. Restituisce sub (user id)." />
            <ScopeCard scope="profile" description="Nome, cognome, data di nascita e genere." />
            <ScopeCard scope="email" description="Indirizzo email dell'utente." />
            <ScopeCard scope="offline_access" description="Ottieni refresh token per accesso persistente." />
            <ScopeCard scope="location" description="Coordinate geografiche (se condivise dall'utente)." />
          </FadeUpStagger>
        </Container>
      </section>

      {/* ── AI Matching ── */}
      <section className="py-24 sm:py-28" id="matching">
        <Container>
          <FadeIn>
            <div className="mb-12">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
                AI
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Come funziona il Matching
              </h2>
            </div>
          </FadeIn>

          <FadeUpStagger className="space-y-8">
            <FadeUpItem>
              <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-7">
                <h3 className="font-semibold text-lg mb-3">1. Questionario psicometrico</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Al primo accesso, l&apos;utente completa un questionario con domande su
                  personalità, interessi, valori e stile comunicativo. Le risposte sono
                  testo libero analizzato dall&apos;AI.
                </p>
              </div>
            </FadeUpItem>

            <FadeUpItem>
              <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-7">
                <h3 className="font-semibold text-lg mb-3">2. Embedding vettoriale</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  L&apos;AI genera un embedding vettoriale su 4 assi:
                  <strong> personalità</strong>, <strong>interessi</strong>,{" "}
                  <strong>valori</strong> e <strong>stile comunicativo</strong>.
                  Ogni asse produce un vettore n-dimensionale normalizzato.
                </p>
              </div>
            </FadeUpItem>

            <FadeUpItem>
              <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-7">
                <h3 className="font-semibold text-lg mb-3">3. Calcolo compatibilità</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  La compatibilità tra due utenti è calcolata come media pesata della
                  similarità coseno su ciascun asse. Il risultato è uno score 0-100 con
                  breakdown per asse, che puoi personalizzare con pesi diversi nella
                  query GraphQL.
                </p>
              </div>
            </FadeUpItem>
          </FadeUpStagger>
        </Container>
      </section>

      {/* ── GraphQL ── */}
      <section className="border-t border-border/50 bg-card/30 py-24 sm:py-28" id="graphql">
        <Container>
          <FadeIn>
            <div className="mb-12">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
                API
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                GraphQL API
              </h2>
              <p className="text-muted-foreground mt-3 max-w-2xl">
                L&apos;API GraphQL è accessibile all&apos;endpoint{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">/api/graphql</code>.
                Autentica le richieste con un Bearer token o API Key.
              </p>
            </div>
          </FadeIn>

          <FadeUpStagger className="space-y-6">
            <FadeUpItem>
              <h3 className="font-semibold text-lg mb-3">Query di esempio</h3>
              <CodeBlock language="graphql" filename="queries.gql">
{`# Profilo utente corrente
query Me {
  me {
    id
    name
    email
    profile {
      completedAt
      axes { name embedding }
    }
  }
}

# Trova match compatibili
query FindMatches {
  findMatches(limit: 20, minScore: 60) {
    user { id name givenName }
    score
    breakdown { axis similarity }
  }
}`}
              </CodeBlock>
            </FadeUpItem>
          </FadeUpStagger>
        </Container>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

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
    <FadeUpItem>
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
    </FadeUpItem>
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
    <FadeUpItem>
      <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5">
        <code className="rounded bg-primary/10 px-2 py-1 text-xs font-mono font-semibold text-primary">
          {scope}
        </code>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </FadeUpItem>
  );
}
