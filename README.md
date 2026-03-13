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
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | Backend API base URL (e.g. `http://localhost:8000`) |

Copy `.env.example` to `.env` and fill in the values.

## Auth Flow (Login Only)

1. **Phone Number** → User enters 10-digit Indian mobile number
2. **OTP Request** → `POST /api/auth/technician/login/otp` with `{ username }`
3. **OTP Verify** → `POST /api/auth/technician/login` with `{ username: token, password: otp }`
4. **Role Select** → if `user_role` is null, redirect to role selection
5. **Home** → main app with wallet, QR scan, profile

> There is **no registration flow** in the web app. Users must be pre-existing in the backend to log in.

## Project Structure

```
src/
├── app/           # Root App component, router, query client
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
├── lib/           # Config, constants, formatting utils, toast
├── pages/         # Route-level page components
├── routes/        # Route guards (auth, role)
├── services/      # API client, token storage
├── types/         # TypeScript API interfaces
└── styles/        # (reserved)
```

## Token Storage Strategy

| Priority | Method | Notes |
|---|---|---|
| Primary | In-memory variables | Fastest, most secure, cleared on tab close |
| Fallback | `localStorage` | Persistent login — survives page refresh and tab close |

## Security

- **No secrets** in the client bundle
- **CSP meta tag** in `index.html`
- **No `dangerouslySetInnerHTML`** anywhere
- **API responses NOT cached** by service worker
- **Strict TypeScript** mode enabled

## PWA

- **Install**: Use browser "Add to Home Screen"
- **Offline**: Static assets precached; navigation falls back to `/offline`
- **Updates**: Toast notification when new version available

### Replacing Placeholder Icons
Replace `public/icons/icon-192.png` and `icon-512.png` with real PNG icons.

## Deployment

1. `npm run build` → generates `dist/`
2. Serve `dist/` from any static host
3. Set `VITE_API_BASE_URL` to your production backend
4. Configure CORS on backend for frontend origin
