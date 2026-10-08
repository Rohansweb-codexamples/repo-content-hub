import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ResourceCard } from "@/components/resource-card";
import { ResourceShell } from "@/components/resource-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORY_DETAILS, RESOURCE_CATEGORIES, type Resource, type ResourceCategory } from "@/lib/resources";

export const Route = createFileRoute("/_authenticated/category/$category")({
  beforeLoad: ({ params }) => { if (!RESOURCE_CATEGORIES.includes(params.category as ResourceCategory)) throw notFound(); },
  head: ({ params }) => ({ meta: [
    { title: `${params.category} — The Resource Room` },
    { name: "description", content: `Browse ${params.category} in the member resource library.` },
    { property: "og:title", content: `${params.category} — The Resource Room` },
    { property: "og:description", content: `Browse ${params.category} in the member resource library.` },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useParams();
  const detail = CATEGORY_DETAILS[category as ResourceCategory];
  const [items, setItems] = useState<Resource[]>([]);
  useEffect(() => { supabase.from("resources").select("*").eq("published", true).eq("category", category).order("created_at", { ascending: false }).then(({ data, error }) => { if (error) toast.error(error.message); setItems((data as Resource[]) ?? []); }); }, [category]);
  return <ResourceShell><main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><Button variant="ghost" asChild><Link to="/library"><ArrowLeft />Library</Link></Button><div className="mb-10 mt-10"><p className="text-sm font-semibold text-primary">Curated collection</p><h1 className="mt-2 text-4xl font-semibold sm:text-5xl">{category}</h1><p className="mt-4 text-muted-foreground">{detail.description}</p></div>{items.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <ResourceCard key={item.id} item={item} />)}</div> : <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">No resources in this category yet.</div>}</main></ResourceShell>;
}