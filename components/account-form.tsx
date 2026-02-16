"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckIcon,
  ClipboardListIcon,
  Loader2Icon,
  LogOutIcon,
  MonitorSmartphoneIcon,
  RefreshCwIcon,
  ShieldIcon,
  Trash2Icon,
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
  const givenName = (user.givenName as string) || "";
  const familyName = (user.familyName as string) || "";
  const birthdate = (user.birthdate as string) || "";
  const gender = (user.gender as string) || "";

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
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  // ── Delete Account ──
  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const maybeDeleteUser = (authClient as unknown as {
        deleteUser?: () => Promise<{ error?: { message?: string } }>;
      }).deleteUser;

      if (typeof maybeDeleteUser === "function") {
        const result = await maybeDeleteUser();
        if (result?.error) {
          setDeleteError(result.error.message || "Impossibile eliminare l'account");
          setDeleteLoading(false);
          return;
        }
      } else {
        const response = await fetch("/api/auth/delete-user", {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          setDeleteError("Impossibile eliminare l'account");
          setDeleteLoading(false);
          return;
        }
      }

      await authClient.signOut();
      window.location.href = "/";
    } catch {
      setDeleteError("Impossibile eliminare l'account");
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">
            Account
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Il mio account</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Gestisci il tuo profilo, la sicurezza e il questionario di
            compatibilità.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleSignOut}
          disabled={signOutLoading}
          className="rounded-full shrink-0"
        >
          {signOutLoading ? (
            <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <LogOutIcon className="h-4 w-4 mr-2" />
          )}
          Logout
        </Button>
      </div>

      {/* ── Assessment Status ── */}
      <div
        className={`rounded-2xl border p-5 backdrop-blur-sm ${
          hasCompletedAssessment
            ? "border-green-500/20 bg-green-500/[0.04]"
            : "border-primary/20 bg-primary/[0.04]"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
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
            className="rounded-full"
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
      </div>

      {/* ── Profile Info ── */}
      <Card className="border-border/50 bg-card/60 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <UserIcon className="h-4 w-4 text-primary" />
            </div>
            Informazioni personali
          </CardTitle>
          <CardDescription>
            Questi dati non sono modificabili da questa area.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="givenName">Nome</Label>
                <Input
                  id="givenName"
                  value={givenName}
                  disabled
                  className="opacity-60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="familyName">Cognome</Label>
                <Input
                  id="familyName"
                  value={familyName}
                  disabled
                  className="opacity-60"
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
                  disabled
                  className="opacity-60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Genere</Label>
                <Input
                  id="gender"
                  value={
                    gender === "man"
                      ? "Uomo"
                      : gender === "woman"
                        ? "Donna"
                        : gender === "non_binary"
                          ? "Non binario"
                          : gender || "-"
                  }
                  disabled
                  className="opacity-60"
                />
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
          </div>
        </CardContent>
      </Card>

      {/* ── Change Password ── */}
      <Card className="border-border/50 bg-card/60 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <ShieldIcon className="h-4 w-4 text-primary" />
            </div>
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
              <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-2.5 rounded-xl text-sm">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-500 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
                <CheckIcon className="h-4 w-4" />
                Password aggiornata con successo
              </div>
            )}

            <Button type="submit" disabled={passwordLoading} className="rounded-full">
              {passwordLoading && (
                <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
              )}
              Cambia password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Active Sessions ── */}
      <Card className="border-border/50 bg-card/60 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <MonitorSmartphoneIcon className="h-4 w-4 text-primary" />
            </div>
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
                    className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-background/50 p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {parseUserAgent(ua)}
                        </p>
                        {isCurrent && (
                          <span className="shrink-0 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
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
                        className="shrink-0 text-muted-foreground hover:text-destructive rounded-full"
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

      {/* ── Delete Account ── */}
      <div className="rounded-2xl border border-destructive/20 bg-destructive/[0.03] backdrop-blur-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">Elimina account</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Rimuove definitivamente il tuo account e tutti i dati associati.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={deleteLoading}
                className="rounded-full"
              >
                {deleteLoading ? (
                  <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2Icon className="h-4 w-4 mr-2" />
                )}
                Elimina account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Conferma eliminazione account</AlertDialogTitle>
                <AlertDialogDescription>
                  Questa azione elimina definitivamente il tuo account e tutti i
                  dati associati. Non puo essere annullata.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteLoading}>
                  Annulla
                </AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={deleteLoading}
                  onClick={handleDeleteAccount}
                >
                  {deleteLoading ? "Eliminazione..." : "Elimina account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        {deleteError && (
          <div className="mt-3 bg-destructive/10 border border-destructive/30 text-destructive px-4 py-2.5 rounded-xl text-sm">
            {deleteError}
          </div>
        )}
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
