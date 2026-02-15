"use client";

import { useState } from "react";
import Link from "next/link";
import { updateClient, deleteClient, rotateClientSecret, rotateApiKey } from "@/lib/models/clients/actions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Copy,
  CheckIcon,
  Loader2,
  Save,
  Trash2,
  SettingsIcon,
  CodeIcon,
  UsersIcon,
  UserCheckIcon,
  RefreshCwIcon,
} from "lucide-react";
import { RedirectUriManager } from "../redirect-uri-manager";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ClientUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  joinedAt: Date | null;
  isProfileComplete: boolean;
}

interface ClientStats {
  totalUsers: number;
  activeUsers: number;
}

interface ClientDetailViewProps {
  client: Record<string, unknown>;
  users: ClientUser[];
  stats: ClientStats;
}

export default function ClientDetailView({
  client,
  users,
  stats,
}: ClientDetailViewProps) {
  const router = useRouter();
  const clientId = client.id as string;
  const clientOAuthId = client.clientId as string;
  const clientSecret = client.clientSecret as string;
  const clientName = client.name as string;
  const clientRedirectUris = client.redirectUris as string[];
  const apiKey = (client.apiKey as string) || null;
  const createdAt = client.createdAt as Date;

  // Config form
  const [configLoading, setConfigLoading] = useState(false);
  const [configSuccess, setConfigSuccess] = useState(false);

  // Copy states
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Loading states
  const [keyLoading, setKeyLoading] = useState(false);
  const [secretLoading, setSecretLoading] = useState(false);

  async function handleRotateSecret() {
    if (!confirm("Sei sicuro di voler rigenerare il Client Secret? Tutte le integrazioni esistenti che usano il vecchio secret smetteranno di funzionare.")) return;
    setSecretLoading(true);
    await rotateClientSecret(clientId);
    setSecretLoading(false);
    router.refresh();
  }

  function copyToClipboard(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  async function handleConfigUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setConfigLoading(true);
    setConfigSuccess(false);
    const formData = new FormData(e.currentTarget);
    await updateClient(clientId, formData);
    setConfigSuccess(true);
    setConfigLoading(false);
    setTimeout(() => setConfigSuccess(false), 3000);
  }

  async function handleDeleteClient() {
    if (
      !confirm(
        `Sei sicuro di voler eliminare il client "${clientName}"? Questa azione è irreversibile.`
      )
    )
      return;
    await deleteClient(clientId);
    router.push("/dashboard");
  }

  async function handleRotateApiKey() {
    if (!confirm("Sei sicuro di voler rigenerare l'API Key? La vecchia chiave smetterà di funzionare immediatamente.")) return;
    setKeyLoading(true);
    await rotateApiKey(clientId);
    setKeyLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight truncate">
              {clientName}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Creato il{" "}
            {new Date(createdAt).toLocaleDateString("it-IT", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users" className="gap-1.5">
            <UsersIcon className="h-3.5 w-3.5" />
            Utenti
          </TabsTrigger>
          <TabsTrigger value="integration" className="gap-1.5">
            <CodeIcon className="h-3.5 w-3.5" />
            Sviluppatori
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-1.5">
            <SettingsIcon className="h-3.5 w-3.5" />
            Configurazione
          </TabsTrigger>
        </TabsList>

        {/* ── Users Tab ── */}
        <TabsContent value="users" className="space-y-6">
          {/* Stats Squares */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <UsersIcon className="h-4 w-4" />
                  <CardTitle className="text-sm font-medium">Utenti Totali</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <UserCheckIcon className="h-4 w-4" />
                  <CardTitle className="text-sm font-medium">Utenti Attivi</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.activeUsers}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista Utenti</CardTitle>
              <CardDescription>
                Utenti che hanno autorizzato questa applicazione.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Utente</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Profilo AI</TableHead>
                    <TableHead className="text-right pr-6">Data Unione</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={u.image ?? undefined} />
                            <AvatarFallback className="text-[10px]">
                              {u.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{u.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {u.email}
                      </TableCell>
                      <TableCell>
                        {u.isProfileComplete ? (
                          <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 gap-1">
                            <CheckIcon className="h-3 w-3" /> Completato
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                            In sospeso
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-6 text-sm text-muted-foreground">
                        {u.joinedAt ? new Date(u.joinedAt).toLocaleDateString('it-IT') : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                        Ancora nessun utente per questa applicazione.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Integration Tab ── */}
        <TabsContent value="integration" className="space-y-6">
          {/* 1. OAuth Credentials */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Credenziali OAuth 2.1</CardTitle>
              <CardDescription>
                Identificativi per il flusso di autenticazione degli utenti.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Client ID</Label>
                  <div className="group relative flex items-center">
                    <code className="w-full bg-muted/50 px-3 py-2 rounded-md text-xs font-mono border border-border/50 truncate pr-10">
                      {clientOAuthId}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 h-7 w-7 opacity-70 hover:opacity-100"
                      onClick={() => copyToClipboard(clientOAuthId, "clientId")}
                    >
                      {copiedField === "clientId" ? (
                        <CheckIcon className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Client Secret</Label>
                  <div className="group relative flex items-center gap-1">
                    <code className="w-full bg-muted/50 px-3 py-2 rounded-md text-xs font-mono border border-border/50 truncate pr-16">
                      {clientSecret}
                    </code>
                    <div className="absolute right-1 flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-70 hover:opacity-100"
                        onClick={() => copyToClipboard(clientSecret, "clientSecret")}
                      >
                        {copiedField === "clientSecret" ? (
                          <CheckIcon className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-70 hover:opacity-100"
                        onClick={handleRotateSecret}
                        disabled={secretLoading}
                      >
                        {secretLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RefreshCwIcon className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* OAuth Integration Guide */}
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">1. Authorization URL</Label>
                  <CodeBlock
                    onCopy={copyToClipboard}
                    copiedField={copiedField}
                    field="authUrl"
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/api/auth/authorize?client_id=${clientOAuthId}&redirect_uri=YOUR_REDIRECT_URI&response_type=code&scope=openid+profile+email&code_challenge=...&code_challenge_method=S256`}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">2. Token Endpoint</Label>
                  <CodeBlock
                    onCopy={copyToClipboard}
                    copiedField={copiedField}
                    field="tokenUrl"
                    value={`POST ${typeof window !== "undefined" ? window.location.origin : ""}/api/auth/token`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. API Key (Server-to-Server) */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">API Key (Matching API)</CardTitle>
              <CardDescription>
                Chiave per l&apos;accesso diretto alle API di matching server-to-server.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {apiKey ? (
                  <div className="group relative flex items-center gap-2">
                    <code className="w-full bg-muted/50 px-3 py-2 rounded-md text-xs font-mono border border-border/50 truncate pr-20">
                      {apiKey.substring(0, 12)}••••••••••••••••••••
                    </code>
                    <div className="absolute right-1 flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-70 hover:opacity-100"
                        onClick={() => copyToClipboard(apiKey, "apiKey")}
                      >
                        {copiedField === "apiKey" ? (
                          <CheckIcon className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-70 hover:opacity-100"
                        onClick={handleRotateApiKey}
                        disabled={keyLoading}
                        title="Rigenera API Key"
                      >
                        {keyLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RefreshCwIcon className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Nessuna API key generata.{" "}
                    <Button size="sm" variant="outline" onClick={handleRotateApiKey} disabled={keyLoading}>
                      {keyLoading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                      Genera API Key
                    </Button>
                  </div>
                )}

                {/* GraphQL Integration Guide */}
                <div className="space-y-2 pt-4 border-t">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">GraphQL Matching API</Label>
                  <CodeBlock
                    onCopy={copyToClipboard}
                    copiedField={copiedField}
                    field="graphql"
                    value={`POST ${typeof window !== "undefined" ? window.location.origin : ""}/api/platform/v1/graphql\nHeaders: { "x-api-key": "YOUR_API_KEY" }\n\nquery {\n  findMatches(userId: "...", limit: 10) {\n    user { id name }\n    similarity\n    breakdown { psychological values interests behavioral }\n  }\n}`}
                  />
                </div>

              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Config Tab ── */}
        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Impostazioni Client</CardTitle>
              <CardDescription>
                Modifica il nome e i redirect URI del client OAuth.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleConfigUpdate} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Applicazione</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={clientName}
                    required
                  />
                </div>

                <RedirectUriManager
                  name="redirectUris"
                  defaultValue={clientRedirectUris}
                />

                <div className="flex items-center gap-3">
                  <Button type="submit" disabled={configLoading}>
                    {configLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Salva modifiche
                  </Button>
                  {configSuccess && (
                    <span className="text-sm text-green-500 flex items-center gap-1">
                      <CheckIcon className="h-4 w-4" /> Salvato
                    </span>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive text-base">
                Zona Pericolosa
              </CardTitle>
              <CardDescription>
                L&apos;eliminazione del client rimuoverà permanentemente tutte le
                configurazioni associate.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleDeleteClient}>
                <Trash2 className="mr-2 h-4 w-4" />
                Elimina Client
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CodeBlock({
  value,
  field,
  copiedField,
  onCopy,
}: {
  value: string;
  field: string;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
}) {
  return (
    <div className="relative">
      <pre className="bg-muted/50 border rounded-lg p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">
        {value}
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7"
        onClick={() => onCopy(value, field)}
      >
        {copiedField === field ? (
          <CheckIcon className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}
