"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Questionnaire } from "./questionnaire";
import { authClient } from "@/lib/client";
import { Loader2Icon, CheckCircle2, ClipboardList, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function AssessmentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [session, setSession] = useState<{ user: { name?: string } } | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  // Where to redirect after assessment
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  useEffect(() => {
    authClient.getSession().then((res) => {
      if (res.data) {
        setSession(res.data as { user: { name?: string } });
      }
      setSessionLoading(false);
    });
  }, []);

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user) {
    // Not authenticated — redirect to sign-in
    router.push("/oauth2/sign-in");
    return null;
  }

  const handleComplete = async (
    answers: Record<string, number | string>,
  ) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Errore nel salvataggio");
      }

      setCompleted(true);

      // Wait briefly so user sees success state, then redirect
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Errore nel salvataggio",
      );
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Skip assessment — proceed to redirect
    window.location.href = redirectTo;
  };

  if (loading || completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            {completed ? (
              <>
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <CardTitle>Profilo completato!</CardTitle>
                <CardDescription>
                  Stiamo preparando il tuo profilo con AI...
                </CardDescription>
              </>
            ) : (
              <>
                <Loader2Icon className="h-12 w-12 animate-spin text-primary mx-auto mb-2" />
                <CardTitle>Analisi in corso...</CardTitle>
                <CardDescription>
                  Stiamo generando il tuo profilo di compatibilità con AI.
                  Questo potrebbe richiedere qualche secondo.
                </CardDescription>
              </>
            )}
          </CardHeader>
        </Card>
      </div>
    );
  }

  // ── Choice screen: compile now or skip ──
  if (!showQuestionnaire) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4">
              <span className="text-xl font-bold text-primary-foreground">
                ID
              </span>
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              Benvenuto, {session.user.name}!
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Il tuo account è stato creato con successo.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Questionario di compatibilità</CardTitle>
              <CardDescription>
                Rispondendo a qualche domanda ci aiuterai a trovare persone
                compatibili con te. Ci vogliono circa 5 minuti.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                size="lg"
                onClick={() => setShowQuestionnaire(true)}
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                Compila ora
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                size="lg"
                onClick={handleSkip}
              >
                Rimanda
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-xs text-center text-muted-foreground pt-1">
                Potrai sempre completare il questionario più tardi dalle impostazioni.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── Questionnaire screen ──
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4">
            <span className="text-xl font-bold text-primary-foreground">
              ID
            </span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            Completa il tuo profilo
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ciao {session.user.name}! Rispondi a qualche domanda per aiutarci
            a trovare persone compatibili con te.
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <Questionnaire
          onComplete={handleComplete}
          onSkip={handleSkip}
        />
      </div>
    </div>
  );
}

export default function AssessmentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <AssessmentContent />
    </Suspense>
  );
}
