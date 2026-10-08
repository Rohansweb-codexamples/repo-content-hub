# Modern member resources hub

## What will change
- Add a public sign-in and registration page using email/password and Google.
- Require an account before visitors can browse or open resources.
- Turn the signed-in library into a modern dark workspace with search and dedicated category pages for Presentations, Guides & PDFs, and Media & Assets.
- Add a dedicated page for every resource with an in-page preview when the browser supports the file, plus a clear open/download action.
- Keep uploading, editing, publishing, and deleting restricted to the existing admin role.
- Refresh the admin area to use the same navigation and visual system, with a fixed category selector.
- Add password recovery and a complete reset-password page.

## Access rules
- Registration is open to users, with email confirmation left enabled.
- Signed-in users can read published resources and access their files.
- Only admins can see drafts or change resources and files.
- Accounts use email only; no profile table, names, or avatars will be added.

## Technical details
- Move library pages under the managed authenticated route group and keep `/`, `/auth`, and `/reset-password` public.
- Update database and private-file policies so anonymous access is removed while authenticated access remains limited to published files.
- Use the existing private storage bucket and short-lived signed URLs for previews.
- Add route-specific page metadata and focused tests for the requested access/category rules.
