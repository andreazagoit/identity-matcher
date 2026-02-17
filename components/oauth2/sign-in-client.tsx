"use client";

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/client";
import { FingerprintIcon, Loader2Icon, UserPlusIcon } from "lucide-react";

import { useOAuthFlow } from "@/hooks/use-oauth-flow";
import { mapAuthErrorMessage } from "@/lib/oauth-helpers";
import { signupPasswordless } from "@/lib/actions/signup";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AuthMode = "login" | "signup";
type Gender = "" | "man" | "woman" | "non_binary";

interface SignupData {
  givenName: string;
  familyName: string;
  email: string;
  birthdate: string;
  gender: Gender;
}

const EMPTY_SIGNUP: SignupData = {
  givenName: "",
  familyName: "",
  email: "",
  birthdate: "",
  gender: "",
};

// ---------------------------------------------------------------------------
// Main content
// ---------------------------------------------------------------------------

function SignInContent() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Signup fields
  const [signupData, setSignupData] = useState<SignupData>(EMPTY_SIGNUP);

  const { isOAuthFlow, fallbackRedirect, getContinueUrl } = useOAuthFlow();

  // -- helpers --------------------------------------------------------------

  const fail = (message: string) => {
    setError(message);
    setLoading(false);
  };

  const updateSignup = <K extends keyof SignupData>(k: K, v: SignupData[K]) =>
    setSignupData((prev) => ({ ...prev, [k]: v }));

  const go = (url: string) => {
    window.location.href = url;
  };

  // -- handlers -------------------------------------------------------------

  /** Login with passkey (WebAuthn) */
  const handlePasskeyLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const result = await authClient.signIn.passkey();

      if (result?.error) {
        fail(
          mapAuthErrorMessage(
            result.error as { code?: string; message?: string },
          ),
        );
        return;
      }

      // Resume OAuth flow if active
      if (isOAuthFlow) {
        const continueUrl = getContinueUrl();
        if (continueUrl) {
          go(continueUrl);
          return;
        }
      }

      go(fallbackRedirect);
    } catch {
      fail(
        "Autenticazione con passkey fallita. Assicurati che il dispositivo supporti le passkey.",
      );
    }
  };

  /** Passwordless signup: server action creates user + session, then register passkey */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    if (
      !signupData.birthdate ||
      !/^\d{4}-\d{2}-\d{2}$/.test(signupData.birthdate)
    ) {
      fail("Inserisci una data di nascita valida");
      return;
    }
    if (!signupData.gender) {
      fail("Seleziona il genere");
      return;
    }

    try {
      // 1. Create account via server action (no password involved)
      const result = await signupPasswordless({
        email: signupData.email,
        givenName: signupData.givenName,
        familyName: signupData.familyName,
        birthdate: signupData.birthdate,
        gender: signupData.gender,
      });

      if (!result.success || !result.sessionToken) {
        fail(result.error || "Registrazione fallita");
        return;
      }

      // 2. Set the session cookie so better-auth recognizes the user
      document.cookie = `idm.session_token=${result.sessionToken}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;

      // 3. Register a passkey for the newly created account
      try {
        await authClient.passkey.addPasskey({
          name: "Passkey principale",
        });
      } catch {
        // Passkey registration failed — user can add one later from account page
        console.warn("Passkey registration skipped during signup");
      }

      // 4. Navigate to assessment → then resume OAuth or go home
      if (isOAuthFlow) {
        const continueUrl = getContinueUrl();
        if (!continueUrl) {
          fail("Impossibile continuare il flusso OAuth. Riprova.");
          return;
        }
        go(`/oauth2/assessment?redirect=${encodeURIComponent(continueUrl)}`);
        return;
      }

      go(
        `/oauth2/assessment?redirect=${encodeURIComponent(fallbackRedirect)}`,
      );
    } catch (err) {
      fail(err instanceof Error ? err.message : "Registrazione fallita");
    }
  };

  // -- render ---------------------------------------------------------------

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4">
            <span className="text-xl font-bold text-primary-foreground">
              ID
            </span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            Identity Matcher
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {mode === "login"
              ? "Accedi con la tua passkey"
              : "Crea un nuovo account"}
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-xl mb-5 text-sm">
            {error}
          </div>
        )}

        <Card className="border-border/50 bg-card/60 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle>
              {mode === "login" ? "Accedi" : "Registrati"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Usa la tua passkey (impronta, volto o chiave di sicurezza)"
                : "Compila i dati per creare il tuo account"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {mode === "login" ? (
              <div className="space-y-4">
                <Button
                  onClick={handlePasskeyLogin}
                  disabled={loading}
                  className="w-full h-12 text-base gap-3"
                >
                  {loading ? (
                    <Loader2Icon className="w-5 h-5 animate-spin" />
                  ) : (
                    <FingerprintIcon className="w-5 h-5" />
                  )}
                  Accedi con Passkey
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Il browser ti chiederà di verificare la tua identità tramite
                  impronta digitale, riconoscimento facciale o chiave di
                  sicurezza.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="signup-givenname">Nome</Label>
                    <Input
                      id="signup-givenname"
                      value={signupData.givenName}
                      onChange={(e) =>
                        updateSignup("givenName", e.target.value)
                      }
                      required
                      placeholder="Mario"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-familyname">Cognome</Label>
                    <Input
                      id="signup-familyname"
                      value={signupData.familyName}
                      onChange={(e) =>
                        updateSignup("familyName", e.target.value)
                      }
                      required
                      placeholder="Rossi"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupData.email}
                    onChange={(e) => updateSignup("email", e.target.value)}
                    required
                    placeholder="tu@esempio.com"
                    autoComplete="email"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="signup-birthdate">Data di nascita</Label>
                    <Input
                      id="signup-birthdate"
                      type="date"
                      value={signupData.birthdate}
                      onChange={(e) =>
                        updateSignup("birthdate", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Genere</Label>
                    <Select
                      value={signupData.gender}
                      onValueChange={(v) =>
                        updateSignup("gender", v as Gender)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleziona..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="man">Uomo</SelectItem>
                        <SelectItem value="woman">Donna</SelectItem>
                        <SelectItem value="non_binary">Non binario</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/50 border border-border/50 p-3">
                  <div className="flex items-start gap-2.5">
                    <FingerprintIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Dopo la registrazione ti verrà chiesto di configurare una{" "}
                      <strong className="text-foreground">passkey</strong> per
                      accedere in modo sicuro senza password.
                    </p>
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <Loader2Icon className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <UserPlusIcon className="w-4 h-4 mr-2" />
                  )}
                  Crea account
                </Button>
              </form>
            )}

            <Separator className="my-6" />

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {mode === "login"
                  ? "Non hai un account? "
                  : "Hai già un account? "}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "login" ? "signup" : "login");
                    setError(null);
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  {mode === "login" ? "Registrati" : "Accedi"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page wrapper with Suspense boundary
// ---------------------------------------------------------------------------

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center bg-background">
          <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
