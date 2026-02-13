import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  LayoutDashboardIcon,
  LogInIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Container } from "./container";

export async function Header() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
      <Container className="flex h-14 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">
              ID
            </span>
          </div>
          <span className="font-semibold text-sm hidden sm:inline">
            Identity Matcher
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild className="gap-1.5">
                <Link href="/dashboard">
                  <LayoutDashboardIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" asChild>
                <Link href="/account">
                  <Avatar className="h-7 w-7">
                    <AvatarImage
                      src={user.image ?? undefined}
                      alt={user.name}
                    />
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                      {(user.name ?? "U").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </Button>
            </>
          ) : (
            <Button size="sm" asChild>
              <Link href="/oauth2/sign-in" className="gap-1.5">
                <LogInIcon className="h-4 w-4" />
                Accedi
              </Link>
            </Button>
          )}
        </nav>
      </Container>
    </header>
  );
}
