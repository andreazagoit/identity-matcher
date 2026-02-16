import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckIcon, ArrowRightIcon, LogInIcon } from "lucide-react";
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

export const metadata: Metadata = {
  title: "Pricing — Identity Matcher",
  description: "Piani e prezzi per Identity Matcher. Gratis durante l'alpha.",
};

// ---------------------------------------------------------------------------
// Plan data
// ---------------------------------------------------------------------------

const plans = [
  {
    name: "Free",
    badge: "Alpha",
    price: "€0",
    period: "per sempre durante l'alpha",
    description: "Perfetto per iniziare e testare l'integrazione.",
    cta: "Inizia gratis",
    ctaVariant: "outline" as const,
    features: [
      "1 Client OAuth",
      "100 utenti attivi / mese",
      "AI Matching base (4 assi)",
      "GraphQL API",
      "OIDC / OpenID Connect",
      "Community support",
    ],
  },
  {
    name: "Pro",
    badge: "Coming soon",
    price: "€29",
    period: "/ mese",
    description: "Per app in produzione con utenti reali.",
    cta: "Contattaci",
    ctaVariant: "default" as const,
    highlighted: true,
    features: [
      "10 Client OAuth",
      "10.000 utenti attivi / mese",
      "AI Matching avanzato",
      "API Keys M2M illimitate",
      "Webhook eventi auth",
      "Priority support",
      "Custom branding login",
      "Analytics dashboard",
    ],
  },
  {
    name: "Enterprise",
    badge: "Coming soon",
    price: "Custom",
    period: "contattaci",
    description: "Per organizzazioni con esigenze specifiche.",
    cta: "Parliamone",
    ctaVariant: "outline" as const,
    features: [
      "Client OAuth illimitati",
      "Utenti illimitati",
      "AI Matching su misura",
      "Deploy on-premise o VPC",
      "SLA garantito 99.9%",
      "Account manager dedicato",
      "Custom integrations",
      "SSO / SAML",
    ],
  },
];

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

const faqs = [
  {
    q: "Quanto dura il piano Free?",
    a: "Durante tutta la fase alpha. Quando lanceremo i piani a pagamento, avrai un periodo di migrazione generoso e prezzi bloccati per gli early adopter.",
  },
  {
    q: "Posso usare Identity Matcher in produzione?",
    a: "Sì, ma tieni presente che siamo in alpha: funzionalità e API possono cambiare. Consigliamo di usarlo per progetti non mission-critical per ora.",
  },
  {
    q: "Come funziona il matching AI?",
    a: "Gli utenti completano un questionario psicometrico. L'AI analizza le risposte e genera embeddings vettoriali su 4 assi. La compatibilità è calcolata come distanza coseno nello spazio vettoriale.",
  },
  {
    q: "Posso self-hostare Identity Matcher?",
    a: "Il piano Enterprise includerà deploy on-premise o VPC. Contattaci per parlarne.",
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function PricingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <>
      {/* Header */}
      <section className="relative isolate overflow-hidden py-24 sm:py-32">
        <GradientBlob className="-top-20 left-1/3 h-[500px] w-[500px] bg-primary/15" />

        <Container className="relative text-center">
          <FadeIn>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
              Pricing
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5">
              Semplice e trasparente.
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Gratis durante l&apos;alpha. Nessuna carta di credito richiesta.
              Inizia a costruire subito.
            </p>
          </FadeIn>
        </Container>
      </section>

      {/* Plans */}
      <Container className="pb-28">
        <FadeUpStagger className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <HoverCard key={plan.name}>
              <div
                className={`relative overflow-hidden rounded-2xl border p-8 h-full flex flex-col ${
                  plan.highlighted
                    ? "border-primary/40 bg-primary/[0.03] shadow-lg shadow-primary/10"
                    : "border-border/50 bg-card/60"
                } backdrop-blur-sm`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-chart-2 to-chart-1" />
                )}

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    {plan.badge && (
                      <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>

                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <CheckIcon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.ctaVariant}
                  asChild
                  className={`w-full rounded-full h-11 ${
                    plan.highlighted ? "shadow-md shadow-primary/20" : ""
                  }`}
                >
                  <Link
                    href={session ? "/dashboard" : "/oauth2/sign-in"}
                    className="gap-2"
                  >
                    {plan.name === "Free" ? (
                      <LogInIcon className="h-4 w-4" />
                    ) : (
                      <ArrowRightIcon className="h-4 w-4" />
                    )}
                    {plan.cta}
                  </Link>
                </Button>
              </div>
            </HoverCard>
          ))}
        </FadeUpStagger>
      </Container>

      {/* FAQ */}
      <section className="border-t border-border/50 bg-card/30 py-24 sm:py-32">
        <Container>
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
                FAQ
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Domande frequenti
              </h2>
            </div>
          </FadeIn>

          <FadeUpStagger className="space-y-6">
            {faqs.map((faq) => (
              <FadeUpItem key={faq.q}>
                <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-6">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </FadeUpItem>
            ))}
          </FadeUpStagger>
        </Container>
      </section>
    </>
  );
}
