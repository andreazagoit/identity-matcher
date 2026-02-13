"use client";

import { useSearchParams } from "next/navigation";
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

type AuthMode = "login" | "signup";

function SignInContent() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    gender: "" as "" | "man" | "woman" | "non_binary",
  });

  // Fallback redirect when not in an OAuth flow
  const fallbackRedirect = searchParams.get("redirect") || "/";

  // Check if we're in an OAuth flow (oauth_query params are in the URL)
  const isOAuthFlow = searchParams.has("client_id") || searchParams.has("sig");

  /**
   * Handle redirect after successful auth.
   *
   * During an OAuth flow, the oauthProviderClient plugin automatically
   * sends oauth_query with sign-in requests. The server responds with
   * { redirect: true, url: "..." } to continue the authorization flow.
   *
   * For sign-up, the plugin does NOT intercept /sign-up/email,
   * so we must call oauth2.continue({ created: true }) manually.
   */
  const handleOAuthRedirect = (data: Record<string, unknown> | null | undefined) => {
    if (data && typeof data === "object" && "url" in data && typeof data.url === "string") {
      window.location.href = data.url;
      return true;
    }
    return false;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await authClient.signIn.email({
        email: loginEmail,
        password: loginPassword,
      });

      if (result.error) {
        setError(result.error.message || "Credenziali non valide");
        setLoading(false);
        return;
      }

      // The oauthProviderClient plugin attaches oauth_query automatically.
      // If we're in an OAuth flow, the server returns { redirect: true, url }
      if (handleOAuthRedirect(result.data as Record<string, unknown>)) return;

      // Normal sign-in (not OAuth flow)
      window.location.href = fallbackRedirect;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Accesso fallito");
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (signupData.password !== signupData.confirmPassword) {
      setError("Le password non corrispondono");
      setLoading(false);
      return;
    }

    try {
      const result = await authClient.signUp.email({
        email: signupData.email,
        password: signupData.password,
        name: `${signupData.firstName} ${signupData.lastName}`,
        // Additional user fields configured in auth.ts
        ...({
          firstName: signupData.firstName,
          lastName: signupData.lastName,
          birthDate: signupData.birthDate,
          gender: signupData.gender || undefined,
        } as Record<string, unknown>),
      });

      if (result.error) {
        setError(result.error.message || "Registrazione fallita");
        setLoading(false);
        return;
      }

      // After signup → redirect to assessment questionnaire.
      // We pass the final redirect as a query param so the assessment
      // page can continue the flow once the user completes it.

      if (isOAuthFlow) {
        // For OAuth flow: get the continue URL first, then pass it to assessment
        const continueRes = await authClient.oauth2.continue({
          created: true,
        });

        if (continueRes.error) {
          setError(continueRes.error.message || "Errore nel flusso OAuth");
          setLoading(false);
          return;
        }

        const data = continueRes.data as Record<string, unknown>;
        if (data && typeof data === "object" && "url" in data && typeof data.url === "string") {
          // Redirect to assessment, then back to the OAuth consent/callback
          const assessmentUrl = `/oauth2/assessment?redirect=${encodeURIComponent(data.url)}&oauth_continue=true`;
          window.location.href = assessmentUrl;
          return;
        }
      }

      // Normal sign-up (not OAuth flow) → go to assessment, then home
      window.location.href = `/oauth2/assessment?redirect=${encodeURIComponent(fallbackRedirect)}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registrazione fallita");
      setLoading(false);
    }
  };

  return (
    <Container className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4">
            <span className="text-xl font-bold text-primary-foreground">ID</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            Identity Matcher
          </h1>
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
            <CardTitle>
              {mode === "login" ? "Accedi" : "Registrati"}
            </CardTitle>
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
                    <Label htmlFor="signup-firstname">Nome</Label>
                    <Input
                      id="signup-firstname"
                      value={signupData.firstName}
                      onChange={(e) =>
                        setSignupData({ ...signupData, firstName: e.target.value })
                      }
                      required
                      placeholder="Mario"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-lastname">Cognome</Label>
                    <Input
                      id="signup-lastname"
                      value={signupData.lastName}
                      onChange={(e) =>
                        setSignupData({ ...signupData, lastName: e.target.value })
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
                    onChange={(e) =>
                      setSignupData({ ...signupData, email: e.target.value })
                    }
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
                      value={signupData.birthDate}
                      onChange={(e) =>
                        setSignupData({ ...signupData, birthDate: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Genere</Label>
                    <Select
                      value={signupData.gender}
                      onValueChange={(v) =>
                        setSignupData({
                          ...signupData,
                          gender: v as "man" | "woman" | "non_binary",
                        })
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

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupData.password}
                    onChange={(e) =>
                      setSignupData({ ...signupData, password: e.target.value })
                    }
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
                    onChange={(e) =>
                      setSignupData({ ...signupData, confirmPassword: e.target.value })
                    }
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
              {mode === "login" ? (
                <p className="text-sm text-muted-foreground">
                  Non hai un account?{" "}
                  <button
                    type="button"
                    onClick={() => { setMode("signup"); setError(null); }}
                    className="text-primary hover:underline font-medium"
                  >
                    Registrati
                  </button>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Hai già un account?{" "}
                  <button
                    type="button"
                    onClick={() => { setMode("login"); setError(null); }}
                    className="text-primary hover:underline font-medium"
                  >
                    Accedi
                  </button>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}

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
