import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { type Resource, fileLabel, formatSize, openResource } from "@/lib/resources";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Resources Hub — Presentations, PDFs & Documents" },
      { name: "description", content: "Browse and download presentations, PDFs and documents." },
      { property: "og:title", content: "Resources Hub" },
      { property: "og:description", content: "Browse and download presentations, PDFs and documents." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [items, setItems] = useState<Resource[] | null>(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  useEffect(() => {
    supabase
      .from("resources")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        setItems((data as Resource[]) ?? []);
      });
  }, []);

  const cats = useMemo(() => ["All", ...new Set((items ?? []).map((r) => r.category))], [items]);
  const shown = (items ?? []).filter(
    (r) =>
      (cat === "All" || r.category === cat) &&
      (r.title + r.description).toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-xl font-bold text-primary">Resources Hub</span>
        <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">
          Admin
        </Link>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-12 pt-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">Library</p>
        <h1 className="mt-3 max-w-3xl text-5xl font-bold leading-tight text-foreground md:text-7xl">
          Presentations, guides & documents.
        </h1>
        <div className="relative mt-10 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search resources" className="h-11 bg-card pl-9" />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                cat === c ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-secondary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        {items === null ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : shown.length === 0 ? (
          <p className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">No resources yet.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((r) => (
              <article key={r.id} className="group flex flex-col rounded-lg border bg-card p-6 transition-shadow hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">{fileLabel(r.file_name)}</span>
                  <span className="text-xs text-muted-foreground">{r.category}</span>
                </div>
                <h2 className="mt-5 text-2xl font-bold">{r.title}</h2>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{r.description}</p>
                <button
                  onClick={() => openResource(r.file_path).catch((e) => toast.error(e.message))}
                  className="mt-6 inline-flex items-center gap-2 self-start text-sm font-semibold text-primary"
                >
                  <Download className="h-4 w-4" /> Download · {formatSize(r.file_size)}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
