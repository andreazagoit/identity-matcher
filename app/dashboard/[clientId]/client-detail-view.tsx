"use client";

import { useState } from "react";
import Link from "next/link";
import { updateClient, deleteClient } from "@/lib/models/clients/actions";
import { createApiKey, deleteApiKey } from "@/lib/models/api-keys/actions";
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
  Plus,
  Trash2,
  ShieldCheck,
  KeyIcon,
  SettingsIcon,
  CodeIcon,
  UsersIcon,
  BrainCircuitIcon,
  UserCheckIcon,
} from "lucide-react";
import { RedirectUriManager } from "../redirect-uri-manager";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ApiKey {
  id: string;
  name: string | null;
  key: string;
  createdAt: Date;
}

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
  apiKeys: ApiKey[];
  users: ClientUser[];
  stats: ClientStats;
}

export default function ClientDetailView({
  client,
  apiKeys: initialApiKeys,
  users,
  stats,
}: ClientDetailViewProps) {
  const router = useRouter();
  const clientId = client.id as string;
  const clientOAuthId = client.clientId as string;
  const clientSecret = client.clientSecret as string;
  const clientName = client.name as string;
  const clientType = client.type as string;
  const clientRedirectUris = client.redirectUris as string[];
  const createdAt = client.createdAt as Date;

  // Config form
  const [configLoading, setConfigLoading] = useState(false);
  const [configSuccess, setConfigSuccess] = useState(false);

  // Copy states
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // API Keys
  const [apiKeys, setApiKeys] = useState(initialApiKeys);
  const [keyLoading, setKeyLoading] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

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

  async function handleCreateApiKey(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setKeyLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("clientId", clientId);
    const result = await createApiKey(formData);
    if (result && "key" in result) {
      setNewKey(result.key);
    }
    setKeyLoading(false);
    (e.target as HTMLFormElement).reset();
  }

  async function handleDeleteApiKey(id: string) {
    if (!confirm("Sei sicuro di voler revocare questa chiave?")) return;
    await deleteApiKey(id);
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
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
            {clientType === "first_party" && (
              <Badge variant="secondary" className="shrink-0 text-[10px]">
                Official
              </Badge>
            )}
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

      {/* Credentials quick-copy bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-1">
              <Label className="text-xs text-muted-foreground">Client ID</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted px-3 py-1.5 rounded-md text-xs font-mono truncate">
                  {clientOAuthId}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-8 w-8"
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
            <div className="flex-1 space-y-1">
              <Label className="text-xs text-muted-foreground uppercase">
                Client Secret
              </Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted px-3 py-1.5 rounded-md text-xs font-mono truncate">
                  {clientSecret}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-8 w-8"
                  onClick={() => copyToClipboard(clientSecret, "clientSecret")}
                >
                  {copiedField === "clientSecret" ? (
                    <CheckIcon className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users" className="gap-1.5">
            <UsersIcon className="h-3.5 w-3.5" />
            Utenti
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-1.5">
            <SettingsIcon className="h-3.5 w-3.5" />
            Configurazione
          </TabsTrigger>
          <TabsTrigger value="apikeys" className="gap-1.5">
            <KeyIcon className="h-3.5 w-3.5" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="integration" className="gap-1.5">
            <CodeIcon className="h-3.5 w-3.5" />
            Integrazione
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
                configurazioni e le API Key associate.
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

        {/* ── API Keys Tab ── */}
        <TabsContent value="apikeys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Genera API Key</CardTitle>
              <CardDescription>
                Crea chiavi server-to-server (M2M) per integrazioni backend.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleCreateApiKey}
                className="flex gap-3 items-end"
              >
                <div className="flex-1 space-y-2">
                  <Label htmlFor="key-name">Nome chiave</Label>
                  <Input
                    id="key-name"
                    name="name"
                    placeholder="Es: Matcher Cron Job"
                    required
                  />
                </div>
                <Button type="submit" disabled={keyLoading}>
                  {keyLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Genera
                </Button>
              </form>

              {newKey && (
                <div className="mt-4 p-4 bg-green-500/5 border border-green-500/20 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-green-500 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Chiave generata! Copiala ora.
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-background p-2 rounded border text-xs break-all font-mono">
                      {newKey}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(newKey, "newKey")}
                    >
                      {copiedField === "newKey" ? (
                        <CheckIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chiavi attive</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Nome</TableHead>
                    <TableHead>Prefisso</TableHead>
                    <TableHead>Creata il</TableHead>
                    <TableHead className="text-right pr-6">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium pl-6">
                        {key.name}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs font-mono">
                          {key.key.substring(0, 8)}…
                        </code>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(key.createdAt).toLocaleDateString("it-IT")}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteApiKey(key.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {apiKeys.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Nessuna API Key generata.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Integration Tab ── */}
        <TabsContent value="integration">
          <Card>
            <CardHeader>
              <CardTitle>Guida Rapida</CardTitle>
              <CardDescription>
                Configura il flusso OAuth 2.1 nella tua applicazione.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">1. Authorization URL</h3>
                <CodeBlock
                  onCopy={copyToClipboard}
                  copiedField={copiedField}
                  field="authUrl"
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/api/auth/authorize?client_id=${clientOAuthId}&redirect_uri=YOUR_REDIRECT_URI&response_type=code&scope=openid+profile+email&code_challenge=...&code_challenge_method=S256`}
                />
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold">2. Token Endpoint</h3>
                <CodeBlock
                  onCopy={copyToClipboard}
                  copiedField={copiedField}
                  field="tokenUrl"
                  value={`POST ${typeof window !== "undefined" ? window.location.origin : ""}/api/auth/token`}
                />
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold">
                  3. GraphQL Matching API
                </h3>
                <CodeBlock
                  onCopy={copyToClipboard}
                  copiedField={copiedField}
                  field="graphql"
                  value={`POST ${typeof window !== "undefined" ? window.location.origin : ""}/api/platform/v1/graphql\nHeaders: { "x-api-key": "YOUR_API_KEY" }\n\nquery {\n  findMatches(userId: "...", limit: 10) {\n    user { id name }\n    similarity\n    breakdown { psychological values interests behavioral }\n  }\n}`}
                />
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Endpoint utili</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                    <span className="text-muted-foreground">
                      OIDC Discovery
                    </span>
                    <code className="text-xs font-mono">
                      /.well-known/openid-configuration
                    </code>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                    <span className="text-muted-foreground">UserInfo</span>
                    <code className="text-xs font-mono">
                      /api/auth/userinfo
                    </code>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                    <span className="text-muted-foreground">JWKS</span>
                    <code className="text-xs font-mono">
                      /api/auth/jwks
                    </code>
                  </div>
                </div>
              </div>
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
