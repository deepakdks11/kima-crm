# Deployment Guide for Kima + Trustodi CRM

## 1. Prerequisites

- **Supabase Account**: You need a Supabase project.
- **Vercel Account**: For hosting the application.
- **Node.js**: Installed locally (optional, for testing).

## 2. Supabase Setup

1.  **Create Project**: Go to [supabase.com](https://supabase.com) and create a new project.
2.  **SQL Schema**: Use the provided `schema.sql` file to set up your database.
    - Go to **SQL Editor** in Supabase dashboard.
    - Copy content of `c:\Users\Axel\kima-crm\schema.sql`.
    - Paste and **Run** the query.
3.  **Auth Configuration**:
    - Go to **Authentication** -> **Providers**.
    - Ensure **Email** provider is enabled.
    - Go to **URL Configuration**:
        - Set **Site URL** to `https://your-vercel-project.vercel.app`.
        - Add `http://localhost:3000` to **Redirect URLs** for local dev.

## 3. Local Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

- Get these keys from Supabase Settings -> API.

## 4. Vercel Deployment

1.  **Push to GitHub**:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    # Add your remote origin
    git push -u origin main
    ```
2.  **Import to Vercel**:
    - Go to Vercel Dashboard -> Add New.
    - Select your Repository.
    - Framework Preset: **Next.js**.
    - Root Directory: `./` (default).
3.  **Environment Variables**:
    - Add `NEXT_PUBLIC_SUPABASE_URL`
    - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4.  **Deploy**: Click Deploy.

## 5. First Time Login

1.  Go to **Authentication** -> **Users** in Supabase.
2.  Manually "Invite User" or just Sign Up via the `/login` page if enabled.
3.  Since RLS is set to "Authenticated", any logged-in user can access the CRM.

## 6. Verification

- Visit the dashboard.
- Add a Lead manually or import CSV.
- Check if it appears in Pipeline.
- Drag and drop to change status.
