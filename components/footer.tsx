import Link from "next/link";
import { Container } from "./container";

export function Footer() {
  return (
    <footer className="border-t bg-card/50">
      <Container className="py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>&copy; {new Date().getFullYear()} Identity Matcher</span>
            <Link
              href="/api/auth/.well-known/openid-configuration"
              className="hover:text-foreground transition-colors"
              target="_blank"
            >
              OIDC Discovery
            </Link>
          </div>
          
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            <Link href="/account" className="hover:text-foreground transition-colors">Account</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
