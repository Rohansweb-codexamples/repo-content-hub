import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Layers3, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "The Resource Room — A private library for useful work" },
    { name: "description", content: "A private member library of presentations, guides and creative resources." },
    { property: "og:title", content: "The Resource Room" },
    { property: "og:description", content: "A private member library of presentations, guides and creative resources." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex h-20 max-w-7xl items-center px-5 sm:px-8">
        <Link to="/" className="font-display text-lg font-semibold">The Resource Room</Link>
        <Button className="ml-auto" variant="outline" asChild><Link to="/auth">Member sign in</Link></Button>
      </header>
      <main>
        <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl content-center gap-12 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-primary">A focused member library</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.05] sm:text-7xl">Useful work deserves a better place to live.</h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">Presentations, practical guides and creative assets, organised for quick discovery and clear previewing.</p>
            <div className="mt-9 flex flex-wrap gap-3"><Button size="lg" asChild><Link to="/auth">Enter the library <ArrowRight /></Link></Button></div>
          </div>
          <div className="grid gap-3">
            {[{ icon: Layers3, title: "Curated collections", text: "Browse presentations, guides and media by category." }, { icon: FileText, title: "Individual previews", text: "Open each resource on its own focused preview page." }, { icon: LockKeyhole, title: "Members only", text: "Create an account to access the private library." }].map(({ icon: Icon, title, text }) => <div key={title} className="rounded-lg border border-border bg-card p-6"><Icon className="size-5 text-primary" /><h2 className="mt-7 text-lg font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div>)}
          </div>
        </section>
      </main>
    </div>
  );
}