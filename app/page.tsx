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
} from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Container } from "@/components/container";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <Container className="py-8">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Gradient glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-primary/8 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-3xl px-4 pt-24 pb-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-xs text-muted-foreground">
            <ZapIcon className="h-3 w-3 text-primary" />
            OAuth 2.1 + AI-Powered Matching
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-5">
            Identità sicura.{" "}
            <span className="text-primary">Compatibilità intelligente.</span>
          </h1>

          <p className="mx-auto max-w-xl text-lg text-muted-foreground leading-relaxed mb-10">
            Identity Matcher è il provider OAuth 2.1 che autentica i tuoi utenti
            e genera profili di compatibilità con intelligenza artificiale.
            Un&apos;unica integrazione per login sicuro e matching avanzato.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {session ? (
              <>
                <Button size="lg" asChild>
                  <Link href="/dashboard" className="gap-2">
                    <LayoutDashboardIcon className="h-4 w-4" />
                    Vai alla Dashboard
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link
                    href="/api/auth/.well-known/openid-configuration"
                    target="_blank"
                    className="gap-2"
                  >
                    OIDC Config
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href="/oauth2/sign-in" className="gap-2">
                    <LogInIcon className="h-4 w-4" />
                    Inizia gratis
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link
                    href="/api/auth/.well-known/openid-configuration"
                    target="_blank"
                    className="gap-2"
                  >
                    OIDC Config
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="mx-auto max-w-5xl px-4 pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
            icon={<ShieldCheckIcon className="h-5 w-5" />}
            title="Multi-tenant"
            description="Ogni app (Space) è un client OAuth isolato. Gli utenti danno consenso per-app, i match sono scoped per community."
          />
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-t bg-card/50">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h2 className="text-2xl font-bold tracking-tight mb-3">
            Come funziona
          </h2>
          <p className="text-muted-foreground mb-12 max-w-lg mx-auto">
            Tre passi per integrare autenticazione e matching nella tua app.
          </p>

          <div className="grid gap-8 sm:grid-cols-3 text-left">
            <Step
              n={1}
              title="Registra un Client"
              description="Crea un client OAuth dalla dashboard. Ricevi client_id e client_secret."
            />
            <Step
              n={2}
              title="Autentica gli utenti"
              description="Usa il flusso Authorization Code + PKCE. Gli utenti completano il questionario AI."
            />
            <Step
              n={3}
              title="Trova i match"
              description="Chiama l'API GraphQL con la tua API Key. Ricevi match ordinati per compatibilità."
            />
          </div>
        </div>
      </section>
    </Container>
  );
}

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
    <div className="group rounded-xl border bg-card p-6 transition-colors hover:border-primary/30">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="font-semibold mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function Step({
  n,
  title,
  description,
}: {
  n: number;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
        {n}
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
