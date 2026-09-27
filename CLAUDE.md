# BHUMI Design & Construction

Follow the project standards in `AGENTS.md`.

## Non-negotiables

- Stack: Next.js App Router, TypeScript, Tailwind, shadcn-style UI, Supabase, Tiptap, React Hook Form and Zod.
- Brand: Bhumi Blue `#2958B1`, Manrope, white/charcoal neutral system, architectural/editorial restraint.
- Security: strict TypeScript, Supabase RLS, protected `/admin`, server-only service key, Zod validated mutations and explicit server/client boundaries.
- Content: the portfolio is the only source of factual company and project content. No fabricated credentials, imagery or statistics.
- Design: no generic construction template, no glassmorphism, no gradients, no overly rounded cards, no excessive shadows.

Use reusable components only where repetition exists. Prefer a clear direct implementation over an abstraction that obscures a small feature. Test affected paths before handoff.
