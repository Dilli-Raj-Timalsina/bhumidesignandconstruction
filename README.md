# BHUMI Design & Construction

A production-minded public portfolio and lightweight CMS for BHUMI Design & Construction Pvt. Ltd., built with Next.js and Supabase.

The public website is designed as an architectural and engineering portfolio. The protected admin workspace manages services, project case studies, gallery albums, insights, site settings and contact inquiries.

## Stack

- Next.js App Router, React and strict TypeScript
- Tailwind CSS, Lucide icons and shadcn-style components
- Supabase Postgres, Auth, Storage and `@supabase/ssr`
- React Hook Form + Zod
- Tiptap rich-text editor

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Run the checks before deployment:

```bash
npm run typecheck
npm run lint
npm run build
```

## Environment

Create `.env.local` from `.env.example`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Use the values from Supabase **Settings → API Keys** as follows:

- `NEXT_PUBLIC_SUPABASE_URL` — the project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — the new publishable key (`sb_publishable_...`). The project retains this legacy-compatible variable name.
- `SUPABASE_SERVICE_ROLE_KEY` — the new secret key (`sb_secret_...`). The project retains this legacy-compatible variable name. It is server-only and must never be exposed to a client component or committed.

The project does not require the database password, JWKS URL, or duplicate `SUPABASE_URL` variables for normal website operation.

For a deployed canonical URL, optionally set `NEXT_PUBLIC_SITE_URL=https://your-domain.example` in Vercel. It is used for metadata, sitemap and robots output.

## Supabase setup

1. Create a Supabase project.
2. In the SQL Editor, run [`supabase/migrations/20260927000000_initial_schema.sql`](supabase/migrations/20260927000000_initial_schema.sql).
3. Run [`supabase/seed.sql`](supabase/seed.sql). It seeds the verified company profile, services, five documented projects, albums and captions from the supplied portfolio. Approved portfolio assets are bundled under `public/` for the initial site and can later be replaced through the admin workspace.
4. In **Authentication**, create the initial admin user with email/password.
5. The migration’s profile trigger creates a regular profile automatically. Promote the initial user after signup:

   ```sql
   update public.profiles
   set is_admin = true
   where id = '<auth-user-uuid>';
   ```

6. Confirm the `media` Storage bucket exists (the migration creates it) and keep its objects public only for content that is intended to appear on the public site.

Do not use the service role key for normal content CRUD. Admin actions use the signed-in SSR session and database policies.

## Content workflow

Visit `/admin/login`, then use the admin workspace to:

- create, publish, edit and delete projects, services, albums and insights;
- upload/caption/order approved imagery;
- review contact messages;
- update company identity, address and contact details.

Only published content is visible publicly. The initial portfolio content is source-backed; future changes should remain supported by approved company material.

## Architecture

```text
src/app/(website)     Public routes and dynamic project/article detail routes
src/app/admin         Protected CMS workspace
src/app/api           Contact and upload endpoints
src/components        Shared UI, public site and admin components
src/features          Content query and feature-level logic
src/lib/supabase      Browser/server Supabase clients and auth middleware
src/lib/validations   Zod mutation schemas
supabase/migrations   Schema, RLS and Storage policies
```

Public pages use server-side Supabase reads and graceful empty states during first-time setup. Admin mutations revalidate the affected public routes. Dynamic SEO lives in route metadata, `sitemap.ts` and `robots.ts`.

## Deployment

1. Push the repository to GitHub/GitLab and import it into Vercel.
2. Set the environment variables in Vercel.
3. Set Supabase Auth redirect URLs for your Vercel production URL and local development URL.
4. Run the migration in the production Supabase project, create/promote an admin account and test login, content publish, image upload, public rendering and contact delivery.
5. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS URL.

Never put `.env.local` in source control. Vercel holds production secrets in its encrypted environment configuration.
