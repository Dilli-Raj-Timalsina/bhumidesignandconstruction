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
# Apply the Supabase migrations first, then synchronize the configured admin.
npm run admin:sync
npm run dev
```

Open `http://localhost:3000`.

Run `admin:sync` after applying the Supabase migrations and whenever the
configured administrator email or password changes. It does not print secrets.

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
ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_RATE_LIMIT_SECRET=
```

Use the values from Supabase **Settings → API Keys** as follows:

- `NEXT_PUBLIC_SUPABASE_URL` — the project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — the new publishable key (`sb_publishable_...`). The project retains this legacy-compatible variable name.
- `SUPABASE_SERVICE_ROLE_KEY` — the new secret key (`sb_secret_...`). The project retains this legacy-compatible variable name. It is server-only and is used only by narrowly scoped server operations: contact-message delivery, the durable login limiter, and the explicit admin sync command.
- `ADMIN_EMAIL` — the single administrator login ID. It must be an email address because Supabase password authentication uses email identities.
- `ADMIN_PASSWORD` — the single administrator password. Use a unique randomly generated password of at least 16 characters.
- `ADMIN_RATE_LIMIT_SECRET` — a separate random secret of at least 32 characters. It HMAC-hashes rate-limit keys, so raw client IP addresses and email addresses are never stored in the rate-limit table.

The project does not require the database password, JWKS URL, or duplicate `SUPABASE_URL` variables for normal website operation.

Keep all three `ADMIN_*` values server-only—never use a `NEXT_PUBLIC_` prefix.
For example, generate a password and independent rate-limit secret with:

```bash
openssl rand -base64 32
openssl rand -hex 32
```

For a deployed canonical URL, optionally set `NEXT_PUBLIC_SITE_URL=https://your-domain.example` in Vercel. It is used for metadata, sitemap and robots output.

## Supabase setup

1. Create a Supabase project.
2. In the SQL Editor, run the migration files in order:
   [`20260927000000_initial_schema.sql`](supabase/migrations/20260927000000_initial_schema.sql), then
   [`20260927120000_admin_security_hardening.sql`](supabase/migrations/20260927120000_admin_security_hardening.sql), then
   [`20260927130000_configured_admin_and_login_rate_limit.sql`](supabase/migrations/20260927130000_configured_admin_and_login_rate_limit.sql).
3. Run [`supabase/seed.sql`](supabase/seed.sql). It seeds the verified company profile, services, five documented projects, albums and captions from the supplied portfolio. Approved portfolio assets are bundled under `public/` for the initial site and can later be replaced through the admin workspace.
4. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_RATE_LIMIT_SECRET` in `.env.local`, then run:

   ```bash
   npm run admin:sync
   ```

   The command creates or updates the confirmed Supabase Auth account, changes
   its password to `ADMIN_PASSWORD`, and atomically selects it as the only CMS
   administrator. No dashboard user creation or manual SQL promotion is needed.
   Run it again immediately after changing `ADMIN_EMAIL` or `ADMIN_PASSWORD`.

5. Confirm the `media` Storage bucket exists (the migration creates it) and keep its objects public only for content that is intended to appear on the public site.

Do not use the service role key for normal content CRUD. Admin actions use the signed-in SSR session and database policies. The only service-key operations are narrowly server-only: validated contact delivery, the login-rate-limit RPCs, and the explicit `admin:sync` command; direct anonymous database inserts remain disabled.

## Security controls

The protected admin workspace requires a confirmed configured account at the request boundary, in every mutation, and again in database RLS. The configuration sync installs that account in a singleton database record, so a prior manually promoted account cannot keep using the CMS API after an administrator rotation. The hardening migration also removes web-side profile promotion, records global settings changes in an append-only audit table for application roles, closes direct anonymous inquiry inserts, and adds a durable per-email inquiry throttle.

Admin sign-in attempts are rate-limited before credentials are checked: five attempts per trusted client-IP key and ten attempts for the configured account in a 15-minute window, followed by a 15-minute lock. The counters use a locked Postgres function and HMAC-only subject keys, work across server instances, and clear only after a complete successful sign-in.

Before a production launch, configure these controls in the Supabase and hosting dashboards as well:

- Disable public signups or use an invite-only admin workflow.
- Keep email confirmation and password leak protection enabled; configure [Supabase Auth CAPTCHA/Turnstile](https://supabase.com/docs/guides/auth/auth-captcha) for sign-in and add server-verified Turnstile to public forms.
- Enrol MFA for every admin account, shorten session/JWT lifetime to your policy, and enable refresh-token reuse protection.
- Tighten the [Supabase Auth rate limits](https://supabase.com/docs/guides/auth/rate-limits) for the password-token endpoint and add a hosting WAF rule for `POST /admin/login`. The application limiter protects this website’s form, while Supabase’s own controls protect its public password endpoint as well.
- Add an edge/WAF rate-limit rule for `/api/contact`; the database throttle limits repeated addresses, while an edge rule provides IP-based protection.
- Never upload confidential or client-private imagery to the public `media` bucket. Use a private review/staging bucket if that workflow is needed.

The application adds clickjacking, MIME-sniffing, referrer, permissions, and transport-security headers. It also validates uploaded image signatures server-side, but production image scanning/re-encoding can be added later if staff upload from untrusted sources.

## Content workflow

Visit `/admin/login`, then use the admin workspace to:

- create, publish, edit and delete projects, services, albums and insights;
- upload/caption/order approved imagery;
- review contact messages;
- update company identity and global website content;
- update public address, phone, email, and location from `/admin/contact`.

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
4. Run the migration in the production Supabase project. With the production environment values loaded locally, run `npm run admin:sync` to create/synchronize the production administrator, then test login, content publish, image upload, public rendering and contact delivery.
5. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS URL.

Never put `.env.local` in source control. Vercel holds production secrets in its encrypted environment configuration.
