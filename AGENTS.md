<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Admin access is granted only via the `user_roles` table (a signup trigger assigns the admin role to the configured admin email); never check admin status client-side alone — RLS enforces it.
- Resource files live in a private storage bucket and are opened via short-lived signed URLs, because the workspace blocks public buckets.
- Member pages live under the managed authenticated route group so library access is enforced consistently before rendering.

## Base44 dev environment

- The app runs via `docker compose -f docker-compose.base44.yml up -d` using `oven/bun:1` with the source bind-mounted at `/app`.
- Dependencies install with `bun install --frozen-lockfile` on container startup; the dev server is `bun run dev -- --host 0.0.0.0 --port 3000` (Vite 8 + TanStack Start SSR).
- Supabase publishable credentials live in the committed `.env` file and are loaded via compose `env_file: .env`. The service role key (`SUPABASE_SERVICE_ROLE_KEY`) is NOT in `.env` — it is only needed for admin operations and is loaded lazily, so the app boots without it.
- Authenticated routes use `ssr: false` (client-side only); the landing page `/` and `/auth` are public and SSR-rendered.
- Vite host allowlisting is handled by `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` (passed bare from the platform environment).
- Verify the app: `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/` should return 200.
