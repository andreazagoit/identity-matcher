import Link from "next/link";
import { Container } from "./container";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/30">
      <Container className="py-10">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 text-sm">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <span className="text-[10px] font-bold text-primary-foreground">ID</span>
              </div>
              <span className="font-semibold">Identity Matcher</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              OAuth 2.1 Provider con AI Matching per l&apos;ecosistema Matcher.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Prodotto
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
                  Documentazione
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Developers */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Sviluppatori
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/api/auth/.well-known/openid-configuration"
                  target="_blank"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  OIDC Discovery
                </Link>
              </li>
              <li>
                <Link href="/docs#graphql" className="text-muted-foreground hover:text-foreground transition-colors">
                  GraphQL API
                </Link>
              </li>
              <li>
                <Link href="/docs#oauth" className="text-muted-foreground hover:text-foreground transition-colors">
                  OAuth Reference
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Account
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/oauth2/sign-in" className="text-muted-foreground hover:text-foreground transition-colors">
                  Accedi
                </Link>
              </li>
              <li>
                <Link href="/account" className="text-muted-foreground hover:text-foreground transition-colors">
                  Il tuo profilo
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            <Link href="https://www.noxis.agency/" target="_blank" className="text-foreground font-medium hover:text-primary transition-colors">
              Noxis Agency
            </Link>
          </p>
          <p>Andrea Zago · P.IVA 05668260283 | C.F. ZGANDR97C22B563E</p>
          <p>Trebaseleghe (PD), Italia · Via G. Mazzini 5a, 35010</p>
        </div>
      </Container>
    </footer>
  );
}
