import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ResourceShell } from "@/components/resource-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { canPreviewResource, fileLabel, formatSize, getResourceUrl, type Resource } from "@/lib/resources";

export const Route = createFileRoute("/_authenticated/resource/$id")({
  head: () => ({ meta: [
    { title: "Resource Preview — The Resource Room" },
    { name: "description", content: "Preview and download a member resource." },
    { property: "og:title", content: "Resource Preview — The Resource Room" },
    { property: "og:description", content: "Preview and download a member resource." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ResourcePage,
});

function ResourcePage() {
  const { id } = Route.useParams();
  const [item, setItem] = useState<Resource | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => { supabase.from("resources").select("*").eq("id", id).eq("published", true).maybeSingle().then(async ({ data, error }) => { if (error) toast.error(error.message); if (!data) return; const resource = data as Resource; setItem(resource); try { setUrl(await getResourceUrl(resource.file_path)); } catch (caught) { toast.error((caught as Error).message); } }); }, [id]);
  if (!item) return <ResourceShell><main className="mx-auto max-w-6xl px-4 py-20 text-muted-foreground sm:px-6">Loading resource…</main></ResourceShell>;
  return <ResourceShell><main className="mx-auto max-w-6xl px-4 py-8 sm:px-6"><Button variant="ghost" asChild><Link to="/library"><ArrowLeft />Library</Link></Button><div className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_320px]"><section className="min-h-[520px] overflow-hidden rounded-lg border border-border bg-preview">{url && canPreviewResource(item) ? item.file_type.startsWith("image/") ? <img src={url} alt={item.title} className="h-full max-h-[720px] w-full object-contain" /> : <iframe title={`${item.title} preview`} src={url} className="h-[70vh] min-h-[520px] w-full" /> : <div className="grid min-h-[520px] place-items-center p-10 text-center text-muted-foreground"><div><p className="font-semibold text-foreground">Preview unavailable</p><p className="mt-2 text-sm">Open the file to view it in its original format.</p></div></div>}</section><aside><p className="text-xs font-semibold uppercase text-primary">{item.category}</p><h1 className="mt-3 text-3xl font-semibold">{item.title}</h1><p className="mt-4 leading-7 text-muted-foreground">{item.description || "This resource is ready to view or download."}</p><div className="my-6 border-y border-border py-4 text-sm text-muted-foreground"><p>{item.file_name}</p><p className="mt-1">{fileLabel(item.file_name)} · {formatSize(item.file_size)}</p></div><div className="grid gap-2"><Button disabled={!url} asChild={Boolean(url)}>{url ? <a href={url} target="_blank" rel="noreferrer"><ExternalLink />Open resource</a> : <span>Preparing file…</span>}</Button>{url && <Button variant="outline" asChild><a href={url} download={item.file_name}><Download />Download</a></Button>}</div></aside></div></main></ResourceShell>;
}