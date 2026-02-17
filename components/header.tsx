import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LogInIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Container } from "./container";
import { NavLink } from "./nav-link";

export async function Header() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <Container className="relative flex h-14 items-center justify-between">
        {/* Logo - Left */}
        <div className="flex-1 flex justify-start">
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
        </div>

        {/* Center nav - Absolute Center */}
        <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 text-sm">
          <NavLink
            href="/docs"
            className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            Docs
          </NavLink>
          <NavLink
            href="/pricing"
            className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </NavLink>
          {user && (
            <NavLink
              href="/dashboard"
              className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </NavLink>
          )}
        </nav>

        {/* Right side - Right */}
        <div className="flex-1 flex justify-end">
          <nav className="flex items-center gap-2">
            {/* Mobile nav links */}
            <NavLink
              href="/docs"
              className="md:hidden px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Docs
            </NavLink>
            <NavLink
              href="/pricing"
              className="md:hidden px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </NavLink>
            {user && (
              <NavLink
                href="/dashboard"
                className="md:hidden px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </NavLink>
            )}

            {user ? (
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
            ) : (
              <Button size="sm" asChild className="rounded-full">
                <Link href="/oauth2/sign-in" className="gap-1.5">
                  <LogInIcon className="h-4 w-4" />
                  Accedi
                </Link>
              </Button>
            )}
          </nav>
        </div>
      </Container>
    </header>
  );
}
