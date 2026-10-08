import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ResourceCard } from "@/components/resource-card";
import { ResourceShell } from "@/components/resource-shell";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORY_DETAILS, RESOURCE_CATEGORIES, type Resource } from "@/lib/resources";

export const Route = createFileRoute("/_authenticated/library")({
  head: () => ({ meta: [
    { title: "Member Library — The Resource Room" },
    { name: "description", content: "Search presentations, guides and media in the member resource library." },
    { property: "og:title", content: "Member Library — The Resource Room" },
    { property: "og:description", content: "Search presentations, guides and media in the member resource library." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: LibraryPage,
});

function LibraryPage() {
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("resources").select("*").eq("published", true).order("created_at", { ascending: false }),
      supabase.auth.getUser().then(async ({ data }) => data.user ? supabase.from("user_roles").select("role").eq("user_id", data.user.id).eq("role", "admin").maybeSingle() : { data: null }),
    ]).then(([resources, role]) => {
      if (resources.error) toast.error(resources.error.message);
      setItems((resources.data as Resource[]) ?? []);
      setAdmin(Boolean(role.data));
      setLoading(false);
    });
  }, []);

  const shown = useMemo(() => items.filter((item) => `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(query.toLowerCase())), [items, query]);

  return (
    <ResourceShell admin={admin}>
      <main>
        <section className="border-b border-border bg-panel">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
            <p className="text-sm font-semibold text-primary">Member library</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight sm:text-6xl">Everything useful, in one considered place.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">Browse the latest presentations, practical guides and downloadable media.</p>
            <div className="relative mt-8 max-w-xl"><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="h-12 bg-background pl-11" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the library" /></div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid gap-3 md:grid-cols-3">
            {RESOURCE_CATEGORIES.map((category) => <Link key={category} to="/category/$category" params={{ category }} className="rounded-lg border border-border bg-card p-5 transition hover:border-primary/50"><p className="font-semibold">{category}</p><p className="mt-1 text-sm text-muted-foreground">{CATEGORY_DETAILS[category].description}</p></Link>)}
          </div>
          <div className="mb-5 mt-12 flex items-end justify-between"><div><p className="text-sm text-muted-foreground">Recently added</p><h2 className="mt-1 text-2xl font-semibold">Library resources</h2></div><span className="text-sm text-muted-foreground">{shown.length} items</span></div>
          {loading ? <p className="py-16 text-muted-foreground">Loading your library…</p> : shown.length === 0 ? <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">No matching resources found.</div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{shown.map((item) => <ResourceCard key={item.id} item={item} />)}</div>}
        </section>
      </main>
    </ResourceShell>
  );
}