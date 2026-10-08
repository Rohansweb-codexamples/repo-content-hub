import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BUCKET, type Resource, fileLabel, formatSize, openResource } from "@/lib/resources";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Resources Hub" },
      { name: "description", content: "Upload, edit and publish resources." },
      { property: "og:title", content: "Admin — Resources Hub" },
      { property: "og:description", content: "Upload, edit and publish resources." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return setIsAdmin(null);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [session]);

  if (!ready) return null;
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link to="/" className="font-display text-xl font-bold text-primary">Resources Hub</Link>
        {session && (
          <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>Sign out</Button>
        )}
      </header>
      <main className="mx-auto max-w-5xl px-6 pb-24">
        {!session ? (
          <AuthForm />
        ) : isAdmin === null ? null : !isAdmin ? (
          <p className="mt-10 text-muted-foreground">This account doesn't have admin access.</p>
        ) : (
          <Dashboard />
        )}
      </main>
    </div>
  );
}

function AuthForm() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
    setBusy(false);
    if (res.error) { toast.error(res.error.message); return; }
    if (mode === "up" && !res.data.session) toast.success("Check your email to confirm your account.");
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-16 max-w-sm space-y-4 rounded-lg border bg-card p-8">
      <h1 className="text-3xl font-bold">{mode === "in" ? "Admin sign in" : "Create admin account"}</h1>
      <div className="space-y-2"><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div className="space-y-2"><Label>Password</Label><Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
      <Button type="submit" className="w-full" disabled={busy}>{mode === "in" ? "Sign in" : "Create account"}</Button>
      <button type="button" className="w-full text-sm text-muted-foreground" onClick={() => setMode(mode === "in" ? "up" : "in")}>
        {mode === "in" ? "First time? Create your account" : "Already have an account? Sign in"}
      </button>
    </form>
  );
}

type Draft = { id?: string; title: string; description: string; category: string; published: boolean; file?: File | null };
const empty: Draft = { title: "", description: "", category: "General", published: true, file: null };

function Dashboard() {
  const [items, setItems] = useState<Resource[]>([]);
  const [draft, setDraft] = useState<Draft>(empty);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("resources").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data as Resource[]) ?? []);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!draft.id && !draft.file) { toast.error("Choose a file to upload"); return; }
    setBusy(true);
    try {
      let fileFields = {};
      if (draft.file) {
        const path = `${crypto.randomUUID()}-${draft.file.name.replace(/[^\w.-]+/g, "_")}`;
        const up = await supabase.storage.from(BUCKET).upload(path, draft.file);
        if (up.error) throw up.error;
        fileFields = { file_path: path, file_name: draft.file.name, file_type: draft.file.type, file_size: draft.file.size };
      }
      const row = { title: draft.title, description: draft.description, category: draft.category || "General", published: draft.published, updated_at: new Date().toISOString(), ...fileFields };
      const res = draft.id
        ? await supabase.from("resources").update(row).eq("id", draft.id)
        : await supabase.from("resources").insert(row as never);
      if (res.error) throw res.error;
      toast.success(draft.id ? "Resource updated" : "Resource uploaded");
      setDraft(empty);
      const fileInput = document.getElementById("file") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
      load();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function togglePublish(r: Resource) {
    const { error } = await supabase.from("resources").update({ published: !r.published }).eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    load();
  }

  async function remove(r: Resource) {
    if (!confirm(`Delete "${r.title}"?`)) return;
    await supabase.storage.from(BUCKET).remove([r.file_path]);
    const { error } = await supabase.from("resources").delete().eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    load();
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[380px_1fr]">
      <form onSubmit={save} className="h-fit space-y-4 rounded-lg border bg-card p-6">
        <h2 className="text-2xl font-bold">{draft.id ? "Edit resource" : "Upload resource"}</h2>
        <div className="space-y-2"><Label>Title</Label><Input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></div>
        <div className="space-y-2"><Label>Description</Label><Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div>
        <div className="space-y-2"><Label>Category</Label><Input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} /></div>
        <div className="space-y-2">
          <Label>{draft.id ? "Replace file (optional)" : "File"}</Label>
          <Input id="file" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.key,.xls,.xlsx,.txt,.zip,.png,.jpg" onChange={(e) => setDraft({ ...draft, file: e.target.files?.[0] ?? null })} />
          <p className="text-xs text-muted-foreground">Up to 50 MB</p>
        </div>
        <div className="flex items-center gap-3"><Switch checked={draft.published} onCheckedChange={(v) => setDraft({ ...draft, published: v })} /><Label>Published</Label></div>
        <div className="flex gap-2">
          <Button type="submit" disabled={busy} className="flex-1">{busy ? "Saving…" : draft.id ? "Save changes" : "Upload"}</Button>
          {draft.id && <Button type="button" variant="outline" onClick={() => setDraft(empty)}>Cancel</Button>}
        </div>
      </form>

      <div>
        <h2 className="text-2xl font-bold">All resources ({items.length})</h2>
        <ul className="mt-4 divide-y rounded-lg border bg-card">
          {items.length === 0 && <li className="p-6 text-sm text-muted-foreground">Nothing uploaded yet.</li>}
          {items.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-3 p-4">
              <span className="rounded bg-secondary px-2 py-1 text-xs font-bold">{fileLabel(r.file_name)}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.category} · {formatSize(r.file_size)} · {r.published ? "Published" : "Draft"}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => openResource(r.file_path).catch((e) => toast.error(e.message))}>View</Button>
              <Button size="sm" variant="outline" onClick={() => togglePublish(r)}>{r.published ? "Unpublish" : "Publish"}</Button>
              <Button size="sm" variant="outline" onClick={() => setDraft({ id: r.id, title: r.title, description: r.description, category: r.category, published: r.published, file: null })}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => remove(r)}>Delete</Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
