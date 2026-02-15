"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import {
  CheckIcon,
  ClipboardListIcon,
  Loader2Icon,
  LogOutIcon,
  MonitorSmartphoneIcon,
  RefreshCwIcon,
  ShieldIcon,
  UserIcon,
  XIcon,
} from "lucide-react";

interface AccountFormProps {
  user: Record<string, unknown>;
  currentSessionToken: string;
  sessions: Array<Record<string, unknown>>;
  hasCompletedAssessment: boolean;
}

export default function AccountForm({
  user,
  currentSessionToken,
  sessions: initialSessions,
  hasCompletedAssessment,
}: AccountFormProps) {
  // Profile state
  const [givenName, setGivenName] = useState(
    (user.givenName as string) || ""
  );
  const [familyName, setFamilyName] = useState(
    (user.familyName as string) || ""
  );
  const [birthdate, setBirthdate] = useState(
    (user.birthdate as string) || ""
  );
  const [gender, setGender] = useState((user.gender as string) || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Sessions state
  const [sessions, setSessions] = useState(initialSessions);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [signOutLoading, setSignOutLoading] = useState(false);

  // ── Profile Update ──
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      const result = await authClient.updateUser({
        name: `${givenName} ${familyName}`,
        givenName,
        familyName,
        birthdate,
        gender: gender || undefined,
      } as Record<string, unknown>);

      if (result.error) {
        setProfileError(
          result.error.message || "Errore nell'aggiornamento del profilo"
        );
      } else {
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : "Errore nell'aggiornamento"
      );
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Password Change ──
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("Le password non corrispondono");
      setPasswordLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("La nuova password deve avere almeno 8 caratteri");
      setPasswordLoading(false);
      return;
    }

    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });

      if (result.error) {
        setPasswordError(
          result.error.message || "Errore nel cambio password"
        );
      } else {
        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSuccess(false), 3000);
      }
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Errore nel cambio password"
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // ── Revoke Session ──
  const handleRevokeSession = async (sessionToken: string) => {
    setRevokingId(sessionToken);
    try {
      await authClient.revokeSession({ token: sessionToken });
      setSessions((prev) => prev.filter((s) => s.token !== sessionToken));
    } catch {
      // ignore
    } finally {
      setRevokingId(null);
    }
  };

  // ── Sign Out ──
  const handleSignOut = async () => {
    setSignOutLoading(true);
    try {
      await authClient.signOut();
      window.location.href = "/";
    } catch {
      setSignOutLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Il mio account</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestisci il tuo profilo, la sicurezza e il questionario di
          compatibilità.
        </p>
      </div>

      {/* ── Assessment Status ── */}
      <Card
        className={
          hasCompletedAssessment
            ? "border-green-500/20 bg-green-500/5"
            : "border-primary/20 bg-primary/5"
        }
      >
        <CardContent className="py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  hasCompletedAssessment
                    ? "bg-green-500/10 text-green-500"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {hasCompletedAssessment ? (
                  <CheckIcon className="h-5 w-5" />
                ) : (
                  <ClipboardListIcon className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {hasCompletedAssessment
                    ? "Profilo di compatibilità completato"
                    : "Questionario non ancora compilato"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {hasCompletedAssessment
                    ? "Il tuo profilo AI è attivo. Puoi rifare il test per aggiornarlo."
                    : "Completa il questionario per attivare il matching AI."}
                </p>
              </div>
            </div>
            <Button
              variant={hasCompletedAssessment ? "outline" : "default"}
              size="sm"
              asChild
            >
              <Link
                href={`/oauth2/assessment?redirect=/account`}
                className="gap-1.5 shrink-0"
              >
                {hasCompletedAssessment ? (
                  <>
                    <RefreshCwIcon className="h-3.5 w-3.5" />
                    Rifai il test
                  </>
                ) : (
                  <>
                    <ClipboardListIcon className="h-3.5 w-3.5" />
                    Compila ora
                  </>
                )}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Profile Info ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserIcon className="h-4 w-4" />
            Informazioni personali
          </CardTitle>
          <CardDescription>Aggiorna i tuoi dati di profilo</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="givenName">Nome</Label>
                <Input
                  id="givenName"
                  value={givenName}
                  onChange={(e) => setGivenName(e.target.value)}
                  required
                  placeholder="Mario"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="familyName">Cognome</Label>
                <Input
                  id="familyName"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  required
                  placeholder="Rossi"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthdate">Data di nascita</Label>
                <Input
                  id="birthdate"
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Genere</Label>
                <Select value={gender} onValueChange={setGender}>
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
              <Label>Email</Label>
              <Input
                value={user.email as string}
                disabled
                className="opacity-60"
              />
              <p className="text-xs text-muted-foreground">
                L&apos;email non può essere modificata da qui
              </p>
            </div>

            {profileError && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-2 rounded-lg text-sm">
                {profileError}
              </div>
            )}

            {profileSuccess && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-500 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                <CheckIcon className="h-4 w-4" />
                Profilo aggiornato con successo
              </div>
            )}

            <Button type="submit" disabled={profileLoading}>
              {profileLoading && (
                <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
              )}
              Salva modifiche
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Change Password ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldIcon className="h-4 w-4" />
            Sicurezza
          </CardTitle>
          <CardDescription>Modifica la tua password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Password attuale</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nuova password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Minimo 8 caratteri"
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Conferma</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Ripeti la password"
                  autoComplete="new-password"
                />
              </div>
            </div>

            {passwordError && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-2 rounded-lg text-sm">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-500 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                <CheckIcon className="h-4 w-4" />
                Password aggiornata con successo
              </div>
            )}

            <Button type="submit" disabled={passwordLoading}>
              {passwordLoading && (
                <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
              )}
              Cambia password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Active Sessions ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MonitorSmartphoneIcon className="h-4 w-4" />
            Sessioni attive
          </CardTitle>
          <CardDescription>
            Dispositivi attualmente connessi al tuo account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nessuna sessione attiva
            </p>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => {
                const isCurrent = s.token === currentSessionToken;
                const ua =
                  (s.userAgent as string) || "Dispositivo sconosciuto";
                const ip = (s.ipAddress as string) || "";
                const createdAt = s.createdAt
                  ? new Date(
                      s.createdAt as string
                    ).toLocaleDateString("it-IT", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "";

                return (
                  <div
                    key={s.id as string}
                    className="flex items-center justify-between gap-4 rounded-lg border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {parseUserAgent(ua)}
                        </p>
                        {isCurrent && (
                          <span className="shrink-0 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                            Corrente
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {ip && `${ip} · `}
                        {createdAt}
                      </p>
                    </div>
                    {!isCurrent && (
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={revokingId === (s.token as string)}
                        onClick={() =>
                          handleRevokeSession(s.token as string)
                        }
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        {revokingId === (s.token as string) ? (
                          <Loader2Icon className="h-4 w-4 animate-spin" />
                        ) : (
                          <XIcon className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Sign Out ── */}
      <Separator />

      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium">Esci dall&apos;account</p>
          <p className="text-xs text-muted-foreground">
            Disconnetti la sessione corrente
          </p>
        </div>
        <Button
          variant="destructive"
          onClick={handleSignOut}
          disabled={signOutLoading}
        >
          {signOutLoading ? (
            <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <LogOutIcon className="h-4 w-4 mr-2" />
          )}
          Esci
        </Button>
      </div>
    </div>
  );
}

/** Simplify user agent string to something readable */
function parseUserAgent(ua: string): string {
  if (ua.includes("Chrome") && !ua.includes("Edg")) return "Google Chrome";
  if (ua.includes("Edg")) return "Microsoft Edge";
  if (ua.includes("Firefox")) return "Mozilla Firefox";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
  if (ua.length > 50) return ua.slice(0, 50) + "…";
  return ua;
}
