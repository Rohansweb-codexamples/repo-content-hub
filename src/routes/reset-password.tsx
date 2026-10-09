import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Reset Password — The Resource Room" },
    { name: "description", content: "Choose a new password for your Resource Room account." },
    { property: "og:title", content: "Reset Password — The Resource Room" },
    { property: "og:description", content: "Choose a new password for your Resource Room account." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate(); const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState(""); const [ready, setReady] = useState(false);
  useEffect(() => { const recovery = window.location.hash.includes("type=recovery"); supabase.auth.getSession().then(({ data }) => setReady(recovery || Boolean(data.session))); }, []);
  async function submit(event: FormEvent) { event.preventDefault(); if (password !== confirm) return toast.error("Passwords do not match."); const { error } = await supabase.auth.updateUser({ password }); if (error) return toast.error(error.message); toast.success("Password updated."); navigate({ to: "/library", replace: true }); }
  return <main className="grid min-h-screen place-items-center px-5"><div className="w-full max-w-sm rounded-lg border border-border bg-card p-7"><h1 className="text-3xl font-semibold">Choose a new password</h1><p className="mt-2 text-sm text-muted-foreground">Use at least eight characters.</p>{ready ? <form onSubmit={submit} className="mt-7 space-y-4"><div className="space-y-2"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="confirm-password">Confirm password</Label><Input id="confirm-password" type="password" minLength={8} required value={confirm} onChange={(event) => setConfirm(event.target.value)} /></div><Button className="w-full" type="submit">Update password</Button></form> : <div className="mt-7"><p className="text-sm text-muted-foreground">This reset link is invalid or has expired.</p><Button className="mt-4" variant="outline" asChild><Link to="/auth">Return to sign in</Link></Button></div>}</div></main>;
}