import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Chrome, Library } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

type AuthSearch = { redirect?: string };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({ redirect: typeof search.redirect === "string" && search.redirect.startsWith("/") ? search.redirect : undefined }),
  head: () => ({ meta: [
    { title: "Member Sign In — The Resource Room" },
    { name: "description", content: "Sign in or create an account to access The Resource Room." },
    { property: "og:title", content: "Member Sign In — The Resource Room" },
    { property: "og:description", content: "Sign in or create an account to access The Resource Room." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to: "/library", replace: true }); }); }, [navigate]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true);
    const result = mode === "signin" ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth` } });
    setBusy(false);
    if (result.error) return toast.error(result.error.message);
    if (mode === "signup" && !result.data.session) return toast.success("Check your email to confirm your account.");
    navigate({ to: search.redirect === "/admin" ? "/admin" : "/library", replace: true });
  }

  async function googleSignIn() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (result.error) toast.error(result.error.message);
  }

  async function resetPassword() {
    if (!email) return toast.error("Enter your email first.");
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    if (error) toast.error(error.message); else toast.success("Password reset email sent.");
  }

  return <main className="grid min-h-screen lg:grid-cols-[1fr_560px]">
    <section className="hidden border-r border-border bg-panel p-12 lg:flex lg:flex-col lg:justify-between"><a href="/" className="font-display text-lg font-semibold">The Resource Room</a><div><p className="text-sm font-semibold text-primary">Private member access</p><h1 className="mt-4 max-w-xl text-6xl font-semibold leading-tight">A calmer way to find the work that matters.</h1></div><p className="text-sm text-muted-foreground">Presentations · Guides · Media</p></section>
    <section className="flex items-center px-5 py-12 sm:px-14"><div className="mx-auto w-full max-w-sm"><span className="grid size-11 place-items-center rounded-md bg-primary text-primary-foreground"><Library /></span><h2 className="mt-8 text-3xl font-semibold">{mode === "signin" ? "Welcome back" : "Join the library"}</h2><p className="mt-2 text-sm text-muted-foreground">{mode === "signin" ? "Sign in to continue to your resources." : "Create your free member account."}</p><Button variant="outline" className="mt-8 w-full" onClick={googleSignIn}><Chrome />Continue with Google</Button><div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or use email<span className="h-px flex-1 bg-border" /></div><form onSubmit={submit} className="space-y-4"><div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></div><div className="space-y-2"><div className="flex justify-between"><Label htmlFor="password">Password</Label>{mode === "signin" && <button type="button" onClick={resetPassword} className="text-xs text-primary hover:underline">Forgot password?</button>}</div><Input id="password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} /></div><Button type="submit" className="w-full" disabled={busy}>{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</Button></form><p className="mt-6 text-center text-sm text-muted-foreground">{mode === "signin" ? "New here?" : "Already a member?"} <button type="button" className="font-semibold text-foreground hover:text-primary" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>{mode === "signin" ? "Create an account" : "Sign in"}</button></p></div></section>
  </main>;
}