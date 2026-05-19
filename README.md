# JobFinder Frontend

React + Vite client for the JobFinder API.

## Prerequisites
- Node.js 18+ (Node 20 recommended)
- A running JobFinder backend reachable from this app (see `VITE_API_BASE_URL` below)

## Setup

```bash
npm install
cp .env.example .env.development   # if not already present
# edit .env.development if your backend isn't on http://localhost:8000
npm run dev                        # http://localhost:3000
```

## Configuration

The only env var the app needs is the API base URL:

| Var | Used by | Example |
|---|---|---|
| `VITE_API_BASE_URL` | All `fetch`/`apiFetch` calls in `src/` | `http://localhost:8000` (dev) / `https://api.yourdomain.com` (prod) |

Vite loads `.env.development` for `npm run dev` and `.env.production` for `npm run build`. Local overrides go in `.env.local` (gitignored).

## Auth model

- **Access token** — JWT in `localStorage`, sent as `Authorization: Bearer …` on every request via `src/utils/apiFetch.js`.
- **Refresh token** — `httpOnly` cookie set by the API on login (`/auth/login`), used by `/auth/refresh`. Cross-origin requests that touch this cookie use `credentials: 'include'`.

When deploying frontend and backend on different origins, the backend must:
- Set the refresh cookie with `SameSite=None; Secure` (so requires HTTPS on both)
- Have CORS `allow_origins` set to the exact frontend origin (not `*`) and `allow_credentials=True`

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server with HMR on `:3000` |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |

## Project layout

```
src/
  components/    # presentational + small composites
  context/       # AuthContext
  hooks/         # useAuth
  pages/         # route-level components
  utils/         # apiFetch, helpers
  App.jsx        # router
  main.jsx       # entrypoint
```

## Deployment

Static output lives in `dist/` after `npm run build`. Deploy to any static host (Vercel, Netlify, S3+CloudFront, or nginx).

For Vercel/Netlify:
- Build command: `npm run build`
- Output dir: `dist`
- Set `VITE_API_BASE_URL` in the project's environment variables

Self-hosted (nginx):
```nginx
location / {
  root /var/www/jobfinder-frontend/dist;
  try_files $uri $uri/ /index.html;
}
```
The `try_files … /index.html` line is required for React Router to handle client-side routes.
