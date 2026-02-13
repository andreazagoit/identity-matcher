export default function ClientUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground mt-1">
          Visualizza gli utenti che hanno autorizzato questa applicazione.
        </p>
      </div>
      <div className="border rounded-lg p-12 text-center text-muted-foreground bg-muted/10">
        Lista utenti in arrivo...
      </div>
    </div>
  )
}
