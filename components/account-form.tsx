"use client";

import { useState, useEffect, useCallback } from "react";
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
  FingerprintIcon,
  Loader2Icon,
  LogOutIcon,
  MonitorSmartphoneIcon,
  PlusIcon,
  RefreshCwIcon,
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

  // Passkey state
  type Passkey = { id: string; name?: string | null; createdAt?: string | Date | null; deviceType?: string | null };
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [passkeySuccess, setPasskeySuccess] = useState(false);
  const [deletingPasskeyId, setDeletingPasskeyId] = useState<string | null>(null);

  // Sessions state
  const [sessions, setSessions] = useState(initialSessions);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── Load passkeys ──
  const loadPasskeys = useCallback(async () => {
    try {
      const result = await authClient.passkey.listUserPasskeys();
      if (result?.data) {
        setPasskeys(result.data as Passkey[]);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    loadPasskeys();
  }, [loadPasskeys]);

  // ── Add passkey ──
  const handleAddPasskey = async () => {
    setPasskeyLoading(true);
    setPasskeyError(null);
    setPasskeySuccess(false);

    try {
      const result = await authClient.passkey.addPasskey({
        name: `Passkey ${passkeys.length + 1}`,
      });

      if (result?.error) {
        setPasskeyError((result.error as { message?: string }).message || "Errore nella registrazione della passkey");
      } else {
        setPasskeySuccess(true);
        setTimeout(() => setPasskeySuccess(false), 3000);
        await loadPasskeys();
      }
    } catch {
      setPasskeyError("Registrazione passkey fallita. Assicurati che il dispositivo supporti le passkey.");
    } finally {
      setPasskeyLoading(false);
    }
  };

  // ── Delete passkey ──
  const handleDeletePasskey = async (id: string) => {
    setDeletingPasskeyId(id);
    try {
      await authClient.passkey.deletePasskey({ id });
      setPasskeys((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // silent
    } finally {
      setDeletingPasskeyId(null);
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

      {/* ── Passkeys ── */}
      <Card className="border-border/50 bg-card/60 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <FingerprintIcon className="h-4 w-4 text-primary" />
                </div>
                Passkey
              </CardTitle>
              <CardDescription className="mt-1.5">
                Gestisci le passkey associate al tuo account. Usa impronta, volto o chiave di sicurezza per accedere.
              </CardDescription>
            </div>
            <Button
              onClick={handleAddPasskey}
              disabled={passkeyLoading}
              size="sm"
              variant="outline"
              className="rounded-full shrink-0"
            >
              {passkeyLoading ? (
                <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <PlusIcon className="h-4 w-4 mr-2" />
              )}
              Aggiungi
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {passkeyError && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-2.5 rounded-xl text-sm mb-4">
              {passkeyError}
            </div>
          )}

          {passkeySuccess && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-500 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 mb-4">
              <CheckIcon className="h-4 w-4" />
              Passkey aggiunta con successo
            </div>
          )}

          {passkeys.length === 0 ? (
            <div className="text-center py-6">
              <FingerprintIcon className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Nessuna passkey registrata.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Aggiungi una passkey per accedere senza password.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {passkeys.map((pk) => {
                const createdAt = pk.createdAt
                  ? new Date(pk.createdAt).toLocaleDateString("it-IT", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "";

                return (
                  <div
                    key={pk.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-background/50 p-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FingerprintIcon className="h-5 w-5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {pk.name || "Passkey"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {pk.deviceType === "singleDevice"
                            ? "Dispositivo singolo"
                            : pk.deviceType === "multiDevice"
                              ? "Multi-dispositivo"
                              : ""}
                          {createdAt && ` · Aggiunta il ${createdAt}`}
                        </p>
                      </div>
                    </div>
                    {passkeys.length > 1 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deletingPasskeyId === pk.id}
                            className="shrink-0 text-muted-foreground hover:text-destructive rounded-full"
                          >
                            {deletingPasskeyId === pk.id ? (
                              <Loader2Icon className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2Icon className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Rimuovi passkey
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Vuoi rimuovere la passkey &quot;{pk.name || "Passkey"}&quot;?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annulla</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletePasskey(pk.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Rimuovi
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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
