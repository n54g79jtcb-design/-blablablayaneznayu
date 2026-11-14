# Korean Study App

A static Korean learning app with lessons, vocabulary, practice, progress tracking, account login, friend features and a Supabase-backed tutor.

## Hosting

The source repository is `n54g79jtcb-design/-blablablayaneznayu`. GitHub Pages is the existing host; Cloudflare Pages can serve the same website from a free `*.pages.dev` address without changing source code.

### Cloudflare Pages deployment

1. In [Cloudflare Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages) choose Create application > Pages > Connect to Git.
2. Authorize GitHub and import `n54g79jtcb-design/-blablablayaneznayu`.
3. Choose a new Cloudflare Pages project name (suggested: `hangulbloom` if available).
4. Production branch: `main`.
5. Framework preset: None; build command: leave blank (or `exit 0`); build output directory: `.` (repository root).
6. Save and deploy. Keep GitHub Pages online until the new site is fully verified.

### Supabase authentication redirect configuration

In the Supabase project `edlysmrqqnxvvdnizrpz` > Authentication > URL Configuration:
- Set **Site URL** to the *actual* published Cloudflare Pages URL after deployment.
- Add **Redirect URLs** for the new Cloudflare Pages URL (e.g. `https://hangulbloom.pages.dev/**`) and keep the original `https://n54g79jtcb-design.github.io/-blablablayaneznayu/**` during migration.
- The client signup confirmation now selects the current hosting origin automatically.

### Preserve existing progress

Browsers isolate localStorage by origin. The old GitHub domain's local progress does **not** move automatically to a new `pages.dev` domain. Before the move, sign in at the old site and click Account > Sync now. Also download My Plan > Export backup. After the move, log in with the same account on Cloudflare Pages to load the saved progress. If anything is missing, use My Plan > Import backup.

Cloudflare Pages is for serving static client assets only. Supabase continues to host the database, authentication and the `korean-tutor` Edge Function. Never put `OPENAI_API_KEY` or a Supabase secret/service-role key into this public repository.

## Local development

Open `index.html` using a local HTTP server. JavaScript and CSS assets live in the repository root. The PWA service worker uses relative URLs so the app works on both an existing GitHub project path and a Cloudflare root path.
