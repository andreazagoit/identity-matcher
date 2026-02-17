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
import {
  ArrowLeftIcon,
  Loader2Icon,
  LogInIcon,
  MailIcon,
  UserPlusIcon,
} from "lucide-react";

import { useOAuthFlow } from "@/hooks/use-oauth-flow";
import { mapAuthErrorMessage } from "@/lib/oauth-helpers";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AuthMode = "login" | "signup";
type LoginStep = "email" | "otp";
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

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginStep, setLoginStep] = useState<LoginStep>("email");
  const [otp, setOtp] = useState("");

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

  const navigateAfterAuth = () => {
    if (isOAuthFlow) {
      const continueUrl = getContinueUrl();
      if (continueUrl) {
        go(continueUrl);
        return;
      }
    }
    go(fallbackRedirect);
  };

  // -- handlers -------------------------------------------------------------

  /** Step 1: Send OTP to email */
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: loginEmail,
        type: "sign-in",
      });

      if (result?.error) {
        fail(
          mapAuthErrorMessage(
            result.error as { code?: string; message?: string },
          ),
        );
        return;
      }

      setLoginStep("otp");
      setLoading(false);
    } catch (err) {
      fail(err instanceof Error ? err.message : "Invio OTP fallito");
    }
  };

  /** Step 2: Verify OTP and sign in */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const result = await authClient.signIn.emailOtp({
        email: loginEmail,
        otp,
      });

      if (result?.error) {
        fail(
          mapAuthErrorMessage(
            result.error as { code?: string; message?: string },
          ),
        );
        return;
      }

      navigateAfterAuth();
    } catch (err) {
      fail(err instanceof Error ? err.message : "Verifica OTP fallita");
    }
  };

  /** Signup: create account with profile data, then redirect */
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
      // Generate a random password — the user will never use it;
      // login is always via email OTP.
      const randomPassword = crypto.randomUUID() + "!Aa1";

      const result = await authClient.signUp.email({
        email: signupData.email,
        password: randomPassword,
        name: `${signupData.givenName} ${signupData.familyName}`,
        givenName: signupData.givenName,
        familyName: signupData.familyName,
        birthdate: signupData.birthdate,
        gender: signupData.gender,
      } as Parameters<typeof authClient.signUp.email>[0]);

      if (result?.error) {
        fail(
          mapAuthErrorMessage(
            result.error as { code?: string; message?: string },
          ),
        );
        return;
      }

      // After signup, go to assessment then final redirect
      if (isOAuthFlow) {
        const continueUrl = getContinueUrl();
        if (continueUrl) {
          go(`/oauth2/assessment?redirect=${encodeURIComponent(continueUrl)}`);
          return;
        }
      }

      go(
        `/oauth2/assessment?redirect=${encodeURIComponent(fallbackRedirect)}`,
      );
    } catch (err) {
      fail(err instanceof Error ? err.message : "Registrazione fallita");
    }
  };

  /** Go back from OTP step to email step */
  const handleBackToEmail = () => {
    setLoginStep("email");
    setOtp("");
    setError(null);
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
              ? "Accedi al tuo account"
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
              {mode === "login"
                ? loginStep === "email"
                  ? "Accedi"
                  : "Inserisci il codice"
                : "Registrati"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? loginStep === "email"
                  ? "Inserisci la tua email per ricevere un codice di accesso"
                  : `Abbiamo inviato un codice a ${loginEmail}`
                : "Compila i dati per creare il tuo account"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {mode === "login" ? (
              loginStep === "email" ? (
                /* ── Login Step 1: Email ── */
                <form onSubmit={handleSendOtp} className="space-y-4">
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

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2Icon className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <MailIcon className="w-4 h-4 mr-2" />
                    )}
                    Invia codice
                  </Button>
                </form>
              ) : (
                /* ── Login Step 2: OTP ── */
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-otp">Codice OTP</Label>
                    <Input
                      id="login-otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      required
                      placeholder="000000"
                      autoComplete="one-time-code"
                      autoFocus
                      className="text-center text-2xl tracking-[0.5em] font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      Controlla la tua casella email. Il codice scade tra 5
                      minuti.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2Icon className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <LogInIcon className="w-4 h-4 mr-2" />
                    )}
                    Accedi
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBackToEmail}
                    className="w-full gap-2 text-muted-foreground"
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Cambia email
                  </Button>
                </form>
              )
            ) : (
              /* ── Signup Form ── */
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
                      className="dark:[color-scheme:dark]"
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
                    setLoginStep("email");
                    setOtp("");
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
