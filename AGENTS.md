# BHUMI project standards

## Project

BHUMI Design & Construction is a public portfolio and content-managed company site. The website should feel like a modern architectural and engineering practice that also executes construction work—not a generic contractor template.

## Stack

- Next.js App Router + React + strict TypeScript
- Tailwind CSS and shadcn-style primitives
- Supabase Postgres, Auth, Storage and SSR clients
- React Hook Form + Zod
- Tiptap for the deliberately small post editor

## Design

- Use Bhumi Blue `#2958B1` sparingly with white, charcoal and soft neutral surfaces.
- Use Manrope, editorial composition, thin borders and generous whitespace.
- Avoid gradients, glassmorphism, heavy shadows, excessive rounding, safety-orange accents and generic construction-theme decoration.
- Public pages are project-led; admin pages may use utilitarian dashboard patterns.
- Replace the wordmark fallback with the supplied official logo once it is available. Use real approved project photography, not fabricated project imagery.

## Engineering

- Keep public content server-rendered where possible; use client components only for interaction.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Ordinary CMS operations use the authenticated SSR Supabase client and RLS.
- Every mutation validates input with Zod, checks the admin role and revalidates affected public paths.
- Do not disable RLS or add privileged browser access as a shortcut.
- Keep database access in `src/lib/supabase`, public content reads in `src/features/content`, and page-specific UI small.
- Image uploads validate MIME type and size, use Storage paths instead of browser-exposed secrets, and collect useful alt text.

## Content integrity

The supplied portfolio is the source of truth. Never invent project facts, team sizes, dates, clients, awards, prices, history, testimonials or contact details. Use editable CMS fields and intentional empty states when source material is incomplete.

## Workflow

1. Inspect existing behavior before modifying it.
2. Keep changes focused and preserve the route/data contract.
3. Run `npm run typecheck`, `npm run lint`, and `npm run build` for relevant changes.
4. Do not commit `.env*` secrets or storage credentials.
