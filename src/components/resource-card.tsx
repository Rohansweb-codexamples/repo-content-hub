import { Link } from "@tanstack/react-router";
import { ArrowUpRight, FileText, Image, Presentation } from "lucide-react";
import type { Resource } from "@/lib/resources";
import { fileLabel, formatSize } from "@/lib/resources";

function ResourceIcon({ item }: { item: Resource }) {
  if (item.file_type.startsWith("image/")) return <Image />;
  if (item.category === "Presentations") return <Presentation />;
  return <FileText />;
}

export function ResourceCard({ item }: { item: Resource }) {
  return (
    <Link
      to="/resource/$id"
      params={{ id: item.id }}
      className="group flex min-h-64 flex-col rounded-lg border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-xl"
    >
      <div className="flex items-start justify-between">
        <span className="grid size-11 place-items-center rounded-md bg-secondary text-primary"><ResourceIcon item={item} /></span>
        <ArrowUpRight className="size-5 text-muted-foreground transition group-hover:text-primary" />
      </div>
      <div className="mt-auto pt-10">
        <p className="text-xs font-semibold uppercase text-primary">{item.category}</p>
        <h2 className="mt-2 text-xl font-semibold text-card-foreground">{item.title}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{item.description || "Open this resource to preview and download it."}</p>
        <p className="mt-4 text-xs text-muted-foreground">{fileLabel(item.file_name)} · {formatSize(item.file_size)}</p>
      </div>
    </Link>
  );
}