"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { authClient } from "@/lib/client";
import { CheckCircle2Icon, Loader2Icon, ShieldCheckIcon, XCircleIcon } from "lucide-react";

/**
 * Human-readable descriptions for each OAuth scope
 */
const SCOPE_LABELS: Record<string, string> = {
  openid: "Identità OpenID Connect",
  profile: "Leggere le informazioni del tuo profilo",
  email: "Leggere il tuo indirizzo email",
  offline_access: "Mantenere l'accesso anche quando non sei online",
  "read:profile": "Leggere il tuo profilo",
  "write:profile": "Aggiornare il tuo profilo",
  "read:matches": "Trovare utenti compatibili",
  match: "Accedere alle funzionalità di matching",
};

interface ClientInfo {
  name: string;
  icon?: string;
  metadata?: Record<string, unknown>;
}

function ConsentContent() {
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);

  const clientId = searchParams.get("client_id");
  const scope = searchParams.get("scope") || "";
  const scopes = scope.split(" ").filter(Boolean);

  // Fetch the client (public) information
  useEffect(() => {
    async function fetchClient() {
      if (!clientId) {
        setError("Parametro client_id mancante");
        setLoading(false);
        return;
      }

      try {
        const res = await authClient.oauth2.publicClient({
          query: { client_id: clientId },
        });

        if (res.error) {
          setError("Client non trovato");
          setLoading(false);
          return;
        }

        setClientInfo({
          name: (res.data as { name?: string })?.name || clientId,
          icon: (res.data as { icon?: string })?.icon,
        });
      } catch {
        setError("Impossibile recuperare le informazioni del client");
      } finally {
        setLoading(false);
      }
    }

    fetchClient();
  }, [clientId]);

  const handleConsent = async (accept: boolean) => {
    setSubmitting(true);
    setError(null);

    try {
      // Better Auth's consent endpoint accepts/denies
      // The oauthProviderClient plugin auto-adds oauth_query from the URL
      const res = await authClient.oauth2.consent({
        accept,
      });

      if (res.error) {
        setError(res.error.message || "Errore durante il consenso");
        setSubmitting(false);
        return;
      }

      // handleRedirect returns { redirect: true, url: "..." } for JSON requests
      const data = res.data as { redirect?: boolean; url?: string } | undefined;
      if (data?.redirect && data.url) {
        window.location.href = data.url;
      } else {
        setError("Nessun URL di reindirizzamento ricevuto.");
        setSubmitting(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante il consenso");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !clientInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <XCircleIcon className="w-12 h-12 text-destructive mx-auto mb-2" />
            <CardTitle className="text-destructive">Errore</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4">
            <span className="text-xl font-bold text-primary-foreground">ID</span>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2">
              <ShieldCheckIcon className="w-12 h-12 text-primary" />
            </div>
            <CardTitle>Autorizza l&apos;accesso</CardTitle>
            <CardDescription>
              <span className="font-medium text-foreground">{clientInfo?.name}</span>{" "}
              vorrebbe accedere al tuo account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Scopes */}
            <div>
              <p className="text-sm font-medium text-foreground mb-3">
                Questa applicazione avrà accesso a:
              </p>
              <ul className="space-y-2.5">
                {scopes.map((s) => (
                  <li
                    key={s}
                    className="flex items-center text-muted-foreground text-sm"
                  >
                    <CheckCircle2Icon className="w-4 h-4 text-primary mr-2.5 flex-shrink-0" />
                    {SCOPE_LABELS[s] || s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => handleConsent(false)}
                variant="outline"
                disabled={submitting}
                className="flex-1"
              >
                Rifiuta
              </Button>
              <Button
                onClick={() => handleConsent(true)}
                disabled={submitting}
                className="flex-1"
              >
                {submitting && (
                  <Loader2Icon className="w-4 h-4 animate-spin mr-2" />
                )}
                Autorizza
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Potrai revocare l&apos;accesso in qualsiasi momento dalle impostazioni del tuo account.
        </p>
      </div>
    </div>
  );
}

export default function ConsentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ConsentContent />
    </Suspense>
  );
}
