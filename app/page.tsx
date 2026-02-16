import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  HeartHandshakeIcon,
  BrainCircuitIcon,
  SparklesIcon,
  ArrowRightIcon,
  UsersIcon,
  LogInIcon,
  LayoutDashboardIcon,
  CheckIcon,
  ShieldCheckIcon,
  MessageCircleHeartIcon,
  Building2Icon,
  GraduationCapIcon,
  BriefcaseIcon,
  SmileIcon,
  BarChart3Icon,
  PlugIcon,
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
import { Container } from "@/components/container";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <>
      {/* ━━━━━━━━━━ HERO ━━━━━━━━━━ */}
      <section className="relative isolate overflow-hidden py-28 sm:py-36 lg:py-44">
        <GradientBlob className="-top-40 left-1/4 h-[600px] w-[600px] bg-primary/20" />
        <GradientBlob className="top-20 right-0 h-[400px] w-[500px] bg-chart-2/15" />

        <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjAuNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] [background-size:40px_40px]" />

        <Container className="relative text-center">
          <FadeIn delay={0}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur-sm">
              <SparklesIcon className="h-3 w-3" />
              Compatibilità basata su intelligenza artificiale
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="mx-auto max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              Trova le persone{" "}
              <span className="bg-gradient-to-r from-primary via-chart-2 to-chart-1 bg-clip-text text-transparent">
                davvero compatibili.
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Identity Matcher analizza la personalità dei tuoi utenti con un
              questionario psicometrico e intelligenza artificiale, generando
              match di compatibilità reali — non basati su like o foto.
            </p>
          </FadeIn>

          <FadeIn delay={0.35}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              {session ? (
                <>
                  <Button
                    size="lg"
                    asChild
                    className="h-12 px-8 text-base rounded-full shadow-lg shadow-primary/25"
                  >
                    <Link href="/dashboard" className="gap-2">
                      <LayoutDashboardIcon className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="h-12 px-8 text-base rounded-full"
                  >
                    <Link href="/docs" className="gap-2">
                      Documentazione
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    asChild
                    className="h-12 px-8 text-base rounded-full shadow-lg shadow-primary/25"
                  >
                    <Link href="/oauth2/sign-in" className="gap-2">
                      <LogInIcon className="h-4 w-4" />
                      Inizia gratis
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="h-12 px-8 text-base rounded-full"
                  >
                    <Link href="/docs" className="gap-2">
                      Documentazione
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* ━━━━━━━━━━ WHAT IT DOES ━━━━━━━━━━ */}
      <section className="border-y border-border/50 bg-card/30 backdrop-blur-sm py-16 sm:py-20">
        <Container>
          <FadeUpStagger className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              {
                icon: <BrainCircuitIcon className="h-5 w-5" />,
                value: "Analisi AI",
                label: "Personalità su 4 assi",
              },
              {
                icon: <HeartHandshakeIcon className="h-5 w-5" />,
                value: "Match reali",
                label: "Basati su compatibilità",
              },
              {
                icon: <PlugIcon className="h-5 w-5" />,
                value: "1 integrazione",
                label: "Login + matching inclusi",
              },
              {
                icon: <BarChart3Icon className="h-5 w-5" />,
                value: "Score 0–100",
                label: "Per ogni coppia di utenti",
              },
            ].map((stat) => (
              <FadeUpItem key={stat.label} className="text-center">
                <div className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {stat.icon}
                </div>
                <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
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

      {/* ━━━━━━━━━━ HOW IT WORKS ━━━━━━━━━━ */}
      <section className="relative py-28 sm:py-36">
        <GradientBlob className="top-0 -right-40 h-[500px] w-[500px] bg-chart-1/10" />

        <Container>
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
                Come funziona
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                Da registrazione a match{" "}
                <span className="text-muted-foreground">in 3 step.</span>
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
                L&apos;utente si registra, risponde al questionario e ottiene
                match personalizzati. Tu integri una sola API.
              </p>
            </div>
          </FadeIn>

          <FadeUpStagger className="grid gap-8 sm:grid-cols-3">
            <StepCard
              n={1}
              icon={<UsersIcon className="h-5 w-5" />}
              title="L'utente si registra"
              description="Login sicuro tramite la tua app. Identity Matcher gestisce autenticazione, sessioni e consenso privacy."
            />
            <StepCard
              n={2}
              icon={<BrainCircuitIcon className="h-5 w-5" />}
              title="Questionario AI"
              description="Un breve questionario psicometrico. L'intelligenza artificiale analizza le risposte e crea un profilo di personalità su 4 assi."
            />
            <StepCard
              n={3}
              icon={<HeartHandshakeIcon className="h-5 w-5" />}
              title="Match di compatibilità"
              description="Ricevi match ordinati per score con breakdown dettagliato. Filtra per genere, età, distanza e altro."
            />
          </FadeUpStagger>
        </Container>
      </section>

      {/* ━━━━━━━━━━ FEATURES ━━━━━━━━━━ */}
      <section className="relative border-t border-border/50 py-28 sm:py-36 bg-card/30">
        <Container>
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
                Cosa puoi fare
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                Matching intelligente.{" "}
                <span className="text-muted-foreground">
                  Integrazione semplice.
                </span>
              </h2>
            </div>
          </FadeIn>

          <FadeUpStagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<BrainCircuitIcon className="h-5 w-5" />}
              title="Profilo psicometrico AI"
              description="Il questionario analizza personalità, valori, stile relazionale e interessi. L'AI genera embeddings vettoriali su 4 assi di compatibilità."
            />
            <FeatureCard
              icon={<HeartHandshakeIcon className="h-5 w-5" />}
              title="Score di compatibilità"
              description="Ogni coppia di utenti riceve uno score da 0 a 100 con breakdown per asse. Risultati basati su affinità reale, non su apparenza."
            />
            <FeatureCard
              icon={<BarChart3Icon className="h-5 w-5" />}
              title="Filtri avanzati"
              description="Filtra i match per genere, fascia d'età, distanza geografica e numero di risultati. Tutto tramite una singola query GraphQL."
            />
            <FeatureCard
              icon={<ShieldCheckIcon className="h-5 w-5" />}
              title="Login sicuro integrato"
              description="Autenticazione OAuth 2.1 con PKCE inclusa. Non devi gestire password, sessioni o token: ci pensa Identity Matcher."
            />
            <FeatureCard
              icon={<PlugIcon className="h-5 w-5" />}
              title="Un'unica integrazione"
              description="Login e matching in un solo servizio. Configura il client, aggiungi il pulsante di login e chiama l'API dei match."
            />
            <FeatureCard
              icon={<UsersIcon className="h-5 w-5" />}
              title="Multi-app (Spaces)"
              description="Ogni app è isolata: utenti, consensi e match sono separati per community. Gestisci tutto dalla dashboard."
            />
          </FadeUpStagger>
        </Container>
      </section>

      {/* ━━━━━━━━━━ USE CASES ━━━━━━━━━━ */}
      <section className="relative py-28 sm:py-36">
        <GradientBlob className="bottom-0 left-1/4 h-[400px] w-[500px] bg-chart-2/10" />

        <Container>
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
                Use cases
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                Per ogni tipo di connessione.
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
                Identity Matcher non è solo per il dating. Funziona ovunque
                servano connessioni significative tra persone.
              </p>
            </div>
          </FadeIn>

          <FadeUpStagger className="grid gap-5 sm:grid-cols-2">
            <UseCaseCard
              icon={<MessageCircleHeartIcon className="h-5 w-5" />}
              title="Dating app"
              description="Match basati su personalità e valori condivisi, non solo sull'aspetto. Utenti più soddisfatti, retention più alta."
              benefits={[
                "Compatibilità reale vs swipe casuale",
                "Meno ghosting, più conversazioni vere",
                "Differenziazione competitiva",
              ]}
            />
            <UseCaseCard
              icon={<Building2Icon className="h-5 w-5" />}
              title="Community e co-living"
              description="Trova coinquilini, compagni di viaggio o membri di community con cui c'è affinità reale."
              benefits={[
                "Coinquilini compatibili per carattere",
                "Gruppi di viaggio affini",
                "Community più coese",
              ]}
            />
            <UseCaseCard
              icon={<BriefcaseIcon className="h-5 w-5" />}
              title="Team building e HR"
              description="Componi team equilibrati analizzando le dinamiche di personalità. Riduci conflitti e migliora la collaborazione."
              benefits={[
                "Team più bilanciati",
                "Onboarding con mentor compatibili",
                "Riduzione turnover",
              ]}
            />
            <UseCaseCard
              icon={<GraduationCapIcon className="h-5 w-5" />}
              title="Education e mentoring"
              description="Abbina studenti e tutor, mentori e mentee con affinità di stile comunicativo e approccio all'apprendimento."
              benefits={[
                "Tutor-studente più efficaci",
                "Gruppi di studio affini",
                "Mentoring personalizzato",
              ]}
            />
          </FadeUpStagger>
        </Container>
      </section>

      {/* ━━━━━━━━━━ TECH SUMMARY ━━━━━━━━━━ */}
      <section className="border-t border-border/50 bg-card/30 py-20 sm:py-24">
        <Container>
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
                Per sviluppatori
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Standard aperti, integrazione veloce.
              </h2>
            </div>
          </FadeIn>

          <FadeUpStagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "OAuth 2.1 + PKCE", desc: "Autenticazione moderna" },
              { label: "OpenID Connect", desc: "Discovery automatico" },
              { label: "GraphQL API", desc: "Query flessibili" },
              { label: "API Key M2M", desc: "Server-to-server" },
            ].map((item) => (
              <FadeUpItem key={item.label}>
                <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 text-center">
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.desc}
                  </p>
                </div>
              </FadeUpItem>
            ))}
          </FadeUpStagger>

          <FadeIn>
            <div className="mt-8 text-center">
              <Button variant="outline" asChild className="rounded-full">
                <Link href="/docs" className="gap-2">
                  Leggi la documentazione
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* ━━━━━━━━━━ CTA ━━━━━━━━━━ */}
      <section className="relative isolate py-28 sm:py-36 overflow-hidden">
        <GradientBlob className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] bg-primary/15" />

        <Container className="relative text-center">
          <FadeIn>
            <SmileIcon className="mx-auto h-12 w-12 text-primary mb-6" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
              Connessioni più autentiche
              <span className="block text-muted-foreground mt-1">
                iniziano qui.
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Inizia gratis durante l&apos;alpha. Crea il tuo primo client e
              scopri il matching AI in pochi minuti.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                asChild
                className="h-12 px-8 text-base rounded-full shadow-lg shadow-primary/25"
              >
                <Link
                  href={session ? "/dashboard" : "/oauth2/sign-in"}
                  className="gap-2"
                >
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
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-12 px-8 text-base rounded-full"
              >
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

/* ─────────────────────── Sub-components ─────────────────────── */

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

function UseCaseCard({
  icon,
  title,
  description,
  benefits,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
}) {
  return (
    <FadeUpItem>
      <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-7 h-full transition-colors hover:border-primary/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative">
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
          <h3 className="font-semibold text-lg mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {description}
          </p>
          <ul className="space-y-2">
            {benefits.map((b) => (
              <li
                key={b}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <CheckIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </FadeUpItem>
  );
}
