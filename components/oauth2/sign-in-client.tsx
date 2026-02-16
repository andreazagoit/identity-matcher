"use client";

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Loader2Icon } from "lucide-react";
import { Container } from "@/components/container";
import { useOAuthFlow } from "@/hooks/use-oauth-flow";
import {
  mapAuthErrorMessage,
  extractRedirectUrl,
  submitFormPost,
} from "@/lib/oauth-helpers";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AuthMode = "login" | "signup";
type Gender = "" | "man" | "woman" | "non_binary";

interface SignupData {
  givenName: string;
  familyName: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthdate: string;
  gender: Gender;
}

const EMPTY_SIGNUP: SignupData = {
  givenName: "",
  familyName: "",
  email: "",
  password: "",
  confirmPassword: "",
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

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup fields
  const [signupData, setSignupData] = useState<SignupData>(EMPTY_SIGNUP);

  const { isOAuthFlow, fallbackRedirect, getOAuthQuery, getContinueUrl } =
    useOAuthFlow();

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const result = await authClient.signIn.email({
        email: loginEmail,
        password: loginPassword,
      });

      if (result.error) {
        fail(mapAuthErrorMessage(result.error as { code?: string; message?: string }));
        return;
      }

      // Plugin may return { url } to continue the OAuth authorize flow.
      const url = extractRedirectUrl(result.data as Record<string, unknown>);
      if (url) { go(url); return; }

      // Fallback: resume OAuth via constructed /authorize URL.
      if (isOAuthFlow) {
        const continueUrl = getContinueUrl();
        if (continueUrl) { go(continueUrl); return; }
      }

      go(fallbackRedirect);
    } catch (err) {
      // Native form POST fallback for network/CORS issues during OAuth.
      if (isOAuthFlow && err instanceof TypeError) {
        submitFormPost(loginEmail, loginPassword, getOAuthQuery());
        return;
      }
      fail(err instanceof Error ? err.message : "Accesso fallito");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    if (signupData.password !== signupData.confirmPassword) {
      fail("Le password non corrispondono");
      return;
    }
    if (!signupData.birthdate || !/^\d{4}-\d{2}-\d{2}$/.test(signupData.birthdate)) {
      fail("Inserisci una data di nascita valida");
      return;
    }
    if (!signupData.gender) {
      fail("Seleziona il genere");
      return;
    }

    try {
      const result = await authClient.signUp.email({
        email: signupData.email,
        password: signupData.password,
        name: `${signupData.givenName} ${signupData.familyName}`,
        ...({
          givenName: signupData.givenName,
          familyName: signupData.familyName,
          birthdate: signupData.birthdate,
          gender: signupData.gender,
        } as Record<string, unknown>),
      });

      if (result.error) {
        fail(mapAuthErrorMessage(result.error as { code?: string; message?: string }));
        return;
      }

      // After signup → assessment → then resume OAuth or go home.
      if (isOAuthFlow) {
        const continueUrl = getContinueUrl();
        if (!continueUrl) {
          fail("Impossibile continuare il flusso OAuth. Riprova da Matcher.");
          return;
        }
        go(`/oauth2/assessment?redirect=${encodeURIComponent(continueUrl)}`);
        return;
      }

      go(`/oauth2/assessment?redirect=${encodeURIComponent(fallbackRedirect)}`);
    } catch (err) {
      fail(err instanceof Error ? err.message : "Registrazione fallita");
    }
  };

  // -- render ---------------------------------------------------------------

  return (
    <Container className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4">
            <span className="text-xl font-bold text-primary-foreground">ID</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">Identity Matcher</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login" ? "Accedi al tuo account" : "Crea un nuovo account"}
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{mode === "login" ? "Accedi" : "Registrati"}</CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Inserisci le tue credenziali per continuare"
                : "Compila i dati per creare il tuo account"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {mode === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    placeholder="tu@esempio.com"
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading && <Loader2Icon className="w-4 h-4 animate-spin mr-2" />}
                  Accedi
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="signup-givenname">Nome</Label>
                    <Input
                      id="signup-givenname"
                      value={signupData.givenName}
                      onChange={(e) => updateSignup("givenName", e.target.value)}
                      required
                      placeholder="Mario"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-familyname">Cognome</Label>
                    <Input
                      id="signup-familyname"
                      value={signupData.familyName}
                      onChange={(e) => updateSignup("familyName", e.target.value)}
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
                      onChange={(e) => updateSignup("birthdate", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Genere</Label>
                    <Select
                      value={signupData.gender}
                      onValueChange={(v) => updateSignup("gender", v as Gender)}
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

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupData.password}
                    onChange={(e) => updateSignup("password", e.target.value)}
                    required
                    minLength={8}
                    placeholder="Minimo 8 caratteri"
                    autoComplete="new-password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Conferma password</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={(e) => updateSignup("confirmPassword", e.target.value)}
                    required
                    placeholder="Ripeti la password"
                    autoComplete="new-password"
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading && <Loader2Icon className="w-4 h-4 animate-spin mr-2" />}
                  Crea account
                </Button>
              </form>
            )}

            <Separator className="my-6" />

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {mode === "login" ? "Non hai un account? " : "Hai già un account? "}
                <button
                  type="button"
                  onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
                  className="text-primary hover:underline font-medium"
                >
                  {mode === "login" ? "Registrati" : "Accedi"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}

// ---------------------------------------------------------------------------
// Page wrapper with Suspense boundary
// ---------------------------------------------------------------------------

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
