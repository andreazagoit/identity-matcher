"use client";

import { useState } from "react";
import { createClient, deleteClient } from "@/lib/models/clients/actions";
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
import { Trash2, Copy, Plus, Loader2, ExternalLink, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { RedirectUriManager } from "./redirect-uri-manager";

interface Client {
  id: string;
  name: string | null;
  clientId: string;
  type: string | null;
}

export default function ClientsManager({ initialClients }: { initialClients: Client[] }) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClientData, setNewClientData] = useState<{
    clientId: string;
    clientSecret: string;
  } | null>(null);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createClient(formData);
    setNewClientData(result);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Identity</h1>
          <p className="text-muted-foreground mt-1">
            Gestisci le tue applicazioni OAuth 2.1 e le relative API Key.
          </p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setNewClientData(null);
        }}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
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
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Crea Client
                  </Button>
                </DialogFooter>
              </form>
            ) : (
              <div className="space-y-6 py-4">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg space-y-3">
                  <p className="text-sm font-medium text-green-600 flex items-center">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Client creato con successo!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Salva il Secret ora, non potrai più recuperarlo in futuro.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase">Client ID</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-muted p-2 rounded border text-xs font-mono truncate">
                        {newClientData.clientId}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => navigator.clipboard.writeText(newClientData.clientId)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase">Client Secret</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-muted p-2 rounded border text-xs font-mono truncate">
                        {newClientData.clientSecret}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => navigator.clipboard.writeText(newClientData.clientSecret)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Button variant="secondary" className="w-full" onClick={() => setIsModalOpen(false)}>
                  Ho salvato le credenziali
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Nome</TableHead>
                <TableHead>Client ID</TableHead>
                <TableHead className="text-right pr-6">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium pl-6">
                    <div className="flex flex-col">
                      <span>{client.name}</span>
                      {client.type === 'first_party' && (
                        <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">
                          Official App
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                      {client.clientId}
                    </code>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild title="Gestisci">
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
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    Nessun client registrato.
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
