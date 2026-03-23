# Humor Flavor Tool

A prompt chain management tool for building and testing humor flavor caption generators. Built with Next.js 14, Supabase, and Tailwind CSS.

## Features

- 🔐 Auth-gated: only `is_superadmin` or `is_matrix_admin` users can access
- 🌶️ Create, edit, and delete humor flavors
- 🪜 Add, edit, delete, and **drag-to-reorder** steps within a flavor
- ✨ Test a flavor by uploading an image or providing a URL — generates real captions via `api.almostcrackd.ai`
- 🌙 Dark / Light / System theme toggle

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/annabellemclean1/humor-flavor-tool.git
cd humor-flavor-tool
npm install
```

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://qihsgnfjqmkjmoowyfbn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> ⚠️ Never commit `.env.local` — it's in `.gitignore`.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with a Supabase account that has `is_superadmin=true` or `is_matrix_admin=true` in the `profiles` table.

---

## Deploying to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/annabellemclean1/humor-flavor-tool.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your `humor-flavor-tool` repo
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### 3. Disable Deployment Protection

In your Vercel project settings:
1. Go to **Settings → Deployment Protection**
2. Set to **None** (disabled)
3. This allows viewing in Incognito Mode

---

## Supabase RLS Note

If you get "permission denied" errors, you may need to add RLS policies. Run in the Supabase SQL editor:

```sql
-- Allow admins to read/write humor_flavors
create policy "admins can manage humor_flavors"
on humor_flavors for all
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and (profiles.is_superadmin = true or profiles.is_matrix_admin = true)
  )
);

-- Allow admins to read/write humor_flavor_steps
create policy "admins can manage humor_flavor_steps"
on humor_flavor_steps for all
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and (profiles.is_superadmin = true or profiles.is_matrix_admin = true)
  )
);

-- Allow authenticated users to read lookup tables
create policy "authenticated can read llm_models"
on llm_models for select using (auth.role() = 'authenticated');

create policy "authenticated can read llm_input_types"
on llm_input_types for select using (auth.role() = 'authenticated');

create policy "authenticated can read llm_output_types"
on llm_output_types for select using (auth.role() = 'authenticated');

create policy "authenticated can read humor_flavor_step_types"
on humor_flavor_step_types for select using (auth.role() = 'authenticated');
```

---

## Architecture

```
app/
  page.tsx              — server component, auth guard, renders Dashboard
  auth/page.tsx         — login page
  layout.tsx            — root layout with ThemeProvider

components/
  ui/
    Navbar.tsx          — top nav with user info + theme toggle
    ThemeProvider.tsx   — light/dark/system theme context
    ThemeToggle.tsx     — 3-way toggle button
    Modal.tsx           — reusable modal wrapper
    ConfirmDialog.tsx   — delete confirmation dialog
    Spinner.tsx         — loading spinner
  flavors/
    Dashboard.tsx       — main client component, all state
    FlavorCard.tsx      — clickable flavor card with edit/delete
    FlavorForm.tsx      — create/edit flavor modal
  steps/
    StepsPanel.tsx      — DnD sortable list of steps
    StepCard.tsx        — individual step with drag handle
    StepForm.tsx        — create/edit step modal
  captions/
    CaptionTester.tsx   — upload or URL image → generate captions

lib/
  supabase.ts           — client + server Supabase instances
  pipeline.ts           — api.almostcrackd.ai 4-step pipeline
  utils.ts              — slugify, cn, extractCaptionText

types/index.ts          — all TypeScript interfaces
```

## Caption Generation Flow

1. **Generate presigned URL** — `POST /pipeline/generate-presigned-url`
2. **Upload to S3** — `PUT <presignedUrl>` (direct, not via API)
3. **Register image** — `POST /pipeline/upload-image-from-url`
4. **Generate captions** — `POST /pipeline/generate-captions`

All API calls use the logged-in user's Supabase JWT as `Authorization: Bearer <token>`.
