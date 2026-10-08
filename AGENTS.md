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
