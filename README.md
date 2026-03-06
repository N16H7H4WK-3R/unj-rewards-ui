# UNJ Rewards PWA

Production-ready Progressive Web App for the UNJ Rewards loyalty program. Built with **React 19 + TypeScript + Vite + Tailwind CSS v4**.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npx tsc --noEmit

# Lint
npm run lint
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | Backend API base URL (e.g. `http://localhost:8000`) |

Copy `.env.example` to `.env` and fill in the values.

## Project Structure

```
src/
├── app/           # Root providers, router, query client
├── components/    # Shared UI: Button, Input, Card, Toast, Modal, Loader
├── features/      # Feature modules (api + hooks each)
│   ├── auth/      # OTP request, verify, logout
│   ├── home/      # Home page data
│   ├── wallet/    # Wallet balance, transactions
│   ├── qr/        # QR validate & redeem
│   ├── profile/   # Profile get & update
│   ├── role/      # Role selection
│   └── admin/qr/  # Admin QR management
├── hooks/         # Shared hooks (service worker)
├── layouts/       # AppShell with bottom navigation
├── lib/           # Config, constants, formatting utils
├── pages/         # Route-level page components
├── routes/        # Route guards (auth, role)
├── services/      # API client, token storage
├── types/         # TypeScript API interfaces
└── styles/        # (reserved)
```

### Where to Add New Screens
1. Create page in `src/pages/<feature>/`
2. Add API function in `src/features/<feature>/api.ts`
3. Add React Query hook in `src/features/<feature>/hooks.ts`
4. Add route in `src/app/router.tsx`

### Where API Hooks Live
All in `src/features/<feature>/hooks.ts` — one per feature domain.

### Tweaking Theme Tokens
Edit the `@theme` block in `src/index.css`. All colors, shadows, and radii are CSS custom properties consumed by Tailwind.

## Token Storage Strategy

| Priority | Method | Notes |
|---|---|---|
| Primary | In-memory variables | Fastest, most secure, cleared on tab close |
| Fallback | `sessionStorage` | Survives page refresh within same tab |
| NOT used | `localStorage` | Avoided — vulnerable to XSS exfiltration |

Tokens are set on login and cleared on logout or failed refresh.

## Security Notes

- **No secrets** are stored in the client bundle
- **CSP meta tag** in `index.html` restricts script/style/connect sources
- **No `dangerouslySetInnerHTML`** anywhere in the codebase
- **API responses are NOT cached** by the service worker
- **Strict TypeScript** mode enabled

### CSP Recommendation for Production

Set these headers on your CDN/reverse proxy:
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: blob: https:;
  connect-src 'self' https://your-api-domain.com;
  media-src 'self' blob:;
```

## PWA

- **Install**: Use browser "Add to Home Screen" or the install prompt
- **Offline**: Static assets are precached; navigation falls back to `/offline`
- **Updates**: A toast notification appears when a new version is available — tap to refresh
- **Lighthouse**: Designed for high PWA scores (manifest, SW, icons, theme_color)

### Replacing Placeholder Icons
Replace `public/icons/icon-192.png` and `icon-512.png` with real PNG icons.

## Deployment

1. Run `npm run build` → generates `dist/`
2. Serve `dist/` from any static host (Vercel, Netlify, Cloudflare Pages, S3+CloudFront)
3. Set `VITE_API_BASE_URL` to your production backend
4. Configure CORS on your backend to allow the frontend origin
5. Set production CSP headers (see above)
