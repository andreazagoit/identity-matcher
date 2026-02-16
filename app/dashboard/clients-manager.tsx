"use client";

import { useState } from "react";
import { createClient } from "@/lib/models/clients/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Copy, Loader2, ExternalLink, ShieldCheck, CheckIcon, LayoutGridIcon } from "lucide-react";
import Link from "next/link";
import { RedirectUriManager } from "./redirect-uri-manager";

interface Client {
  id: string;
  name: string | null;
  clientId: string;
}

export default function ClientsManager({ initialClients }: { initialClients: Client[] }) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [newClientData, setNewClientData] = useState<{
    clientId: string;
    clientSecret: string;
  } | null>(null);

  function copyToClipboard(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createClient(formData);
    setNewClientData(result);
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">
            Dashboard
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Le tue applicazioni</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Gestisci i tuoi client OAuth 2.1 e le relative API Key.
          </p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setNewClientData(null);
        }}>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-full gap-2">
              <Plus className="h-4 w-4" />
              Nuovo Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Registra Nuovo Client</DialogTitle>
              <DialogDescription>
                Crea un nuovo client OAuth 2.1 per le tue applicazioni.
              </DialogDescription>
            </DialogHeader>
            
            {!newClientData ? (
              <form onSubmit={handleCreate} className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Applicazione</Label>
                  <Input id="name" name="name" placeholder="Es: Matcher App" required />
                </div>
                
                <RedirectUriManager name="redirectUris" />

                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={loading} className="w-full rounded-full">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Crea Client
                  </Button>
                </DialogFooter>
              </form>
            ) : (
              <div className="space-y-6 py-4">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl space-y-3">
                  <p className="text-sm font-medium text-green-500 flex items-center">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Client creato con successo!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Salva il Secret ora, non potrai più recuperarlo in futuro.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Client ID</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-muted/50 p-2.5 rounded-lg border border-border/50 text-xs font-mono truncate">
                        {newClientData.clientId}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-lg"
                        onClick={() => copyToClipboard(newClientData.clientId, "newClientId")}
                      >
                        {copiedField === "newClientId" ? (
                          <CheckIcon className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Client Secret</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-muted/50 p-2.5 rounded-lg border border-border/50 text-xs font-mono truncate">
                        {newClientData.clientSecret}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-lg"
                        onClick={() => copyToClipboard(newClientData.clientSecret, "newClientSecret")}
                      >
                        {copiedField === "newClientSecret" ? (
                          <CheckIcon className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Button variant="secondary" className="w-full rounded-full" onClick={() => setIsModalOpen(false)}>
                  Ho salvato le credenziali
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Clients Table */}
      <Card className="border-border/50 bg-card/60 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="pl-6">Nome</TableHead>
                <TableHead>Client ID</TableHead>
                <TableHead className="text-right pr-6">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialClients.map((client) => (
                <TableRow key={client.id} className="border-border/50">
                  <TableCell className="font-medium pl-6">
                    <span>{client.name}</span>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs font-mono bg-muted/50 px-2 py-1 rounded-md border border-border/50">
                      {client.clientId}
                    </code>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild title="Gestisci" className="rounded-lg">
                        <Link href={`/dashboard/${client.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {initialClients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50">
                        <LayoutGridIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Nessun client registrato</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Crea il tuo primo client OAuth per iniziare.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
