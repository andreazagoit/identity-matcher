import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRightIcon,
  BookOpenIcon,
  CheckCircle2Icon,
  KeyIcon,
  ShieldCheckIcon,
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
  title: "Next.js & Better Auth - Identity Matcher",
  description:
    "Guida specifica per integrare Identity Matcher in Next.js utilizzando better-auth.",
};

export default function NextJsDocsPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative isolate overflow-hidden py-20 sm:py-28">
        <GradientBlob className="-top-20 right-1/4 h-[480px] w-[480px] bg-primary/15" />

        <Container className="relative">
          <FadeIn>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
              <BookOpenIcon className="h-3 w-3" />
              Framework Guide
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5">
              Next.js + Better Auth
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl">
              La via più veloce per integrare Identity Matcher nel tuo progetto Next.js.
              Gestione automatica di sessioni, cookie e refresh token.
            </p>
          </FadeIn>
        </Container>
      </section>

      {/* ── Quick Start ── */}
      <section className="py-12 sm:py-16" id="quick-start">
        <Container>
          <div className="space-y-16">
            {/* Step 1 */}
            <Step number="1" title="Installa le dipendenze">
              <CodeBlock language="bash" filename="Terminal">
                {`npm install better-auth`}
              </CodeBlock>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Assicurati di avere un database configurato nel tuo progetto Next.js.
              </p>
            </Step>

            {/* Step 2 */}
            <Step number="2" title="Variabili ambiente">
              <CodeBlock language="bash" filename=".env.local">
                {`# URL di questo server
IDENTITY_MATCHER_URL=${process.env.NEXT_PUBLIC_APP_URL}

# Credenziali del tuo client (dalla Dashboard)
IDENTITY_MATCHER_CLIENT_ID=il-tuo-client-id
IDENTITY_MATCHER_CLIENT_SECRET=il-tuo-client-secret`}
              </CodeBlock>
            </Step>

            {/* Step 3 */}
            <Step number="3" title="Configura better-auth">
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Crea il file di configurazione server-side. Il plugin{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
                  genericOAuth
                </code>{" "}
                si occuperà di tutto il flusso OIDC.
              </p>

              <CodeBlock language="typescript" filename="lib/auth.ts">
                {`import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
  basePath: "/api/auth",
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "identitymatcher",
          discoveryUrl: \`\${process.env.IDENTITY_MATCHER_URL}/api/auth/.well-known/openid-configuration\`,
          clientId: process.env.IDENTITY_MATCHER_CLIENT_ID!,
          clientSecret: process.env.IDENTITY_MATCHER_CLIENT_SECRET!,
          pkce: true,
          scopes: ["openid", "profile", "email"],
        },
      ],
    }),
    nextCookies(),
  ],
  // Consigliato per gestire ricreazione account
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["identitymatcher"],
    },
  },
});`}
              </CodeBlock>

              <div className="mt-8">
                <p className="text-sm text-muted-foreground mb-4">Configura il client per i componenti React:</p>
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
            </Step>

            {/* Step 4 */}
            <Step number="4" title="Crea la Route Handler">
              <CodeBlock language="typescript" filename="app/api/auth/[...all]/route.ts">
                {`import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);`}
              </CodeBlock>
            </Step>

            {/* Step 5 */}
            <Step number="5" title="Utilizzo nei componenti">
              <CodeBlock language="tsx" filename="components/login-button.tsx">
                {`"use client";
import { signIn } from "@/lib/auth-client";

export function LoginButton() {
  return (
    <button onClick={() => signIn.oauth2({ 
      providerId: "identitymatcher",
      callbackURL: "/dashboard" 
    })}>
      Accedi con Identity Matcher
    </button>
  );
}`}
              </CodeBlock>
            </Step>

            {/* Step 6 */}
            <Step number="6" title="Chiamate GraphQL (Server Side)">
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Per interrogare i match lato server in Next.js, usa l&apos;access token della sessione corrente.
              </p>

              <CodeBlock language="typescript" filename="app/dashboard/page.tsx">
                {`import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) return <div>Non autenticato</div>;

  // Usa l'access token per chiamare GraphQL
  const response = await fetch("${process.env.NEXT_PUBLIC_APP_URL}/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": \`Bearer \${session.session.accessToken}\`
    },
    body: JSON.stringify({
      query: \`
        query GetMatches {
          findMatches(limit: 5) {
            user { name image }
            similarity
          }
        }
      \`
    })
  });

  const { data } = await response.json();
  return (
    <div>
      {data.findMatches.map(m => (
        <div key={m.user.name}>{m.user.name}: {m.similarity}</div>
      ))}
    </div>
  );
}`}
              </CodeBlock>
            </Step>
          </div>

          <div className="mt-20 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-8 text-center">
            <h3 className="text-xl font-semibold mb-3">Serve aiuto?</h3>
            <p className="text-muted-foreground mb-6">
              Torna alla documentazione principale per i dettagli sugli endpoint o l&apos;uso delle API GraphQL.
            </p>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/docs" className="gap-2">
                <ArrowRightIcon className="h-4 w-4 rotate-180" />
                Docs Principale
              </Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
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
      <div className="flex gap-6">
        <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-base font-bold">
          {number}
        </div>
        <div className="flex-1 space-y-4">
          <h3 className="font-semibold text-2xl tracking-tight">{title}</h3>
          {children}
        </div>
      </div>
    </FadeUpItem>
  );
}
