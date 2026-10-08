import { Link, useNavigate } from "@tanstack/react-router";
import { Files, LogOut, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export function ResourceShell({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link to="/library" className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
            <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground"><Files className="size-4" /></span>
            <span className="hidden sm:inline">The Resource Room</span>
          </Link>
          <nav className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild><Link to="/library">Library</Link></Button>
            {admin && <Button variant="ghost" size="sm" asChild><Link to="/admin"><ShieldCheck />Admin</Link></Button>}
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out" title="Sign out"><LogOut /></Button>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}