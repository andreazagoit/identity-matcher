import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ShieldCheckIcon,
  BrainCircuitIcon,
  KeyIcon,
  ZapIcon,
  ArrowRightIcon,
  NetworkIcon,
  LogInIcon,
  LayoutDashboardIcon,
  CheckIcon,
  CodeIcon,
  TerminalIcon,
  GlobeIcon,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  FadeIn,
  FadeUpStagger,
  FadeUpItem,
  HoverCard,
  GradientBlob,
} from "@/components/motion";
import { CodeBlock } from "@/components/code-block";
import { Container } from "@/components/container";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <>
      {/* ━━━━━━━━━━ HERO ━━━━━━━━━━ */}
      <section className="relative isolate overflow-hidden py-28 sm:py-36 lg:py-44">
        {/* Animated gradient blobs */}
        <GradientBlob className="-top-40 left-1/4 h-[600px] w-[600px] bg-primary/20" />
        <GradientBlob className="top-20 right-0 h-[400px] w-[500px] bg-chart-2/15" />

        {/* Grid noise overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjAuNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] [background-size:40px_40px]" />

        <Container className="relative text-center">
          <FadeIn delay={0}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur-sm">
              <ZapIcon className="h-3 w-3" />
              OAuth 2.1 &middot; PKCE &middot; AI Matching
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="mx-auto max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              Identità sicura.{" "}
              <span className="bg-gradient-to-r from-primary via-chart-2 to-chart-1 bg-clip-text text-transparent">
                Compatibilità intelligente.
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Il provider OAuth 2.1 che autentica i tuoi utenti e genera profili
              di compatibilità con intelligenza artificiale. Un&apos;unica
              integrazione per login sicuro e matching avanzato.
            </p>
          </FadeIn>

          <FadeIn delay={0.35}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              {session ? (
                <>
                  <Button size="lg" asChild className="h-12 px-8 text-base rounded-full shadow-lg shadow-primary/25">
                    <Link href="/dashboard" className="gap-2">
                      <LayoutDashboardIcon className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base rounded-full">
                    <Link href="/docs" className="gap-2">
                      Documentazione
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" asChild className="h-12 px-8 text-base rounded-full shadow-lg shadow-primary/25">
                    <Link href="/oauth2/sign-in" className="gap-2">
                      <LogInIcon className="h-4 w-4" />
                      Inizia gratis
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base rounded-full">
                    <Link href="/docs" className="gap-2">
                      Documentazione
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </FadeIn>

          {/* Code snippet teaser */}
          <FadeIn delay={0.5} y={60}>
            <CodeBlock language="typescript" filename="callback.ts" className="mx-auto mt-16 max-w-2xl shadow-2xl shadow-black/20">
              {`// 1. Redirect user to Identity Matcher
const authUrl = \`\${PROVIDER}/api/auth/oauth2/authorize?\` +
  \`client_id=\${CLIENT_ID}&response_type=code\` +
  \`&scope=openid+profile+email&code_challenge=...\`;

// 2. Exchange code for tokens
const tokens = await fetch(\`\${PROVIDER}/api/auth/token\`, {
  method: "POST",
  body: { grant_type: "authorization_code", code },
});

// 3. Get AI compatibility matches
const matches = await gql(\`{
  findMatches(limit: 10) { user { name } score }
}\`);`}
            </CodeBlock>
          </FadeIn>
        </Container>
      </section>

      {/* ━━━━━━━━━━ STATS ━━━━━━━━━━ */}
      <section className="border-y border-border/50 bg-card/30 backdrop-blur-sm">
        <Container>
          <FadeUpStagger className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border/50">
            {[
              { value: "OAuth 2.1", label: "Standard" },
              { value: "PKCE", label: "Flow sicuro" },
              { value: "4 assi", label: "AI matching" },
              { value: "GraphQL", label: "API flessibile" },
            ].map((stat) => (
              <FadeUpItem key={stat.label} className="px-6 py-10 text-center">
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </FadeUpItem>
            ))}
          </FadeUpStagger>
        </Container>
      </section>

      {/* ━━━━━━━━━━ FEATURES ━━━━━━━━━━ */}
      <section className="relative py-28 sm:py-36">
        <GradientBlob className="top-0 -right-40 h-[500px] w-[500px] bg-chart-1/10" />

        <Container>
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
                Funzionalità
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                Tutto ciò che serve.{" "}
                <span className="text-muted-foreground">Niente di più.</span>
              </h2>
            </div>
          </FadeIn>

          <FadeUpStagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<ShieldCheckIcon className="h-5 w-5" />}
              title="OAuth 2.1 + PKCE"
              description="Autenticazione moderna con Proof Key for Code Exchange, JWT access tokens e refresh tokens rotativi."
            />
            <FeatureCard
              icon={<BrainCircuitIcon className="h-5 w-5" />}
              title="AI Matching"
              description="Questionario psicometrico analizzato con AI. Embeddings vettoriali su 4 assi per compatibilità multi-dimensionale."
            />
            <FeatureCard
              icon={<KeyIcon className="h-5 w-5" />}
              title="OpenID Connect"
              description="Compatibile OIDC con id_token, UserInfo endpoint e discovery. Integrazione standard in qualsiasi framework."
            />
            <FeatureCard
              icon={<NetworkIcon className="h-5 w-5" />}
              title="GraphQL API"
              description="API GraphQL per matching-as-a-service. Trova utenti compatibili con query flessibili e filtri avanzati."
            />
            <FeatureCard
              icon={<ZapIcon className="h-5 w-5" />}
              title="API Keys M2M"
              description="Chiavi server-to-server per integrazioni backend. Rate limiting, scoping per client e revoca immediata."
            />
            <FeatureCard
              icon={<GlobeIcon className="h-5 w-5" />}
              title="Multi-tenant"
              description="Ogni app (Space) è un client OAuth isolato. Gli utenti danno consenso per-app, i match sono scoped per community."
            />
          </FadeUpStagger>
        </Container>
      </section>

      {/* ━━━━━━━━━━ HOW IT WORKS ━━━━━━━━━━ */}
      <section className="relative border-t border-border/50 py-28 sm:py-36 bg-card/30">
        <Container>
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
                Integrazione
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                Tre passi. Fatto.
              </h2>
            </div>
          </FadeIn>

          <FadeUpStagger className="grid gap-8 sm:grid-cols-3">
            <StepCard
              n={1}
              icon={<TerminalIcon className="h-5 w-5" />}
              title="Registra un Client"
              description="Crea un client OAuth dalla dashboard. Ricevi client_id e client_secret in pochi secondi."
            />
            <StepCard
              n={2}
              icon={<CodeIcon className="h-5 w-5" />}
              title="Autentica gli utenti"
              description="Usa il flusso Authorization Code + PKCE. Gli utenti completano il questionario AI al primo accesso."
            />
            <StepCard
              n={3}
              icon={<BrainCircuitIcon className="h-5 w-5" />}
              title="Trova i match"
              description="Chiama l'API GraphQL con la tua API Key. Ricevi match ordinati per compatibilità in tempo reale."
            />
          </FadeUpStagger>
        </Container>
      </section>

      {/* ━━━━━━━━━━ CTA ━━━━━━━━━━ */}
      <section className="relative isolate py-28 sm:py-36 overflow-hidden">
        <GradientBlob className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] bg-primary/15" />

        <Container className="relative text-center">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
              Pronto a iniziare?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Crea il tuo primo client OAuth in meno di un minuto.
              Gratis durante l&apos;alpha.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" asChild className="h-12 px-8 text-base rounded-full shadow-lg shadow-primary/25">
                <Link href={session ? "/dashboard" : "/oauth2/sign-in"} className="gap-2">
                  {session ? (
                    <>
                      <LayoutDashboardIcon className="h-4 w-4" />
                      Vai alla Dashboard
                    </>
                  ) : (
                    <>
                      <LogInIcon className="h-4 w-4" />
                      Crea un account
                    </>
                  )}
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base rounded-full">
                <Link href="/pricing" className="gap-2">
                  Piani e prezzi
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <HoverCard>
      <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-7 transition-colors hover:border-primary/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative">
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
          <h3 className="font-semibold text-lg mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </HoverCard>
  );
}

function StepCard({
  n,
  icon,
  title,
  description,
}: {
  n: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <FadeUpItem>
      <div className="relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-7">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
            {n}
          </div>
          <div className="text-primary">{icon}</div>
        </div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </FadeUpItem>
  );
}
