import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '../lib/constants';

interface NavItem {
    path: string;
    label: string;
    isFab?: boolean;
    icon: (active: boolean) => React.ReactNode;
}

const navItems: NavItem[] = [
    {
        path: ROUTES.HOME,
        label: 'Home',
        icon: (active) => (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
            </svg>
        ),
    },
    {
        path: ROUTES.WALLET,
        label: 'Wallet',
        icon: (active) => (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
        ),
    },
    {
        path: ROUTES.SCAN_QR,
        label: 'Scan QR',
        isFab: true,
        icon: (active: boolean) => (
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'currentColor'}>
                <path d="M3 11h2V9H3v2zm0 4h2v-2H3v2zm0-8h2V5H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zm0-10v2h14V5H7zM3 11h2V9H3v2zm0 4h2v-2H3v2zm0-8h2V5H3v2z" />
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="4" height="4" rx="0.5" />
                <rect x="19" y="19" width="2" height="2" />
                <rect x="19" y="14" width="2" height="4" />
                <rect x="14" y="19" width="4" height="2" />
            </svg>
        ),
    },
    {
        path: ROUTES.PROFILE,
        label: 'Profile',
        icon: (active) => (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
    },
];

export default function AppShell() {
    const location = useLocation();

    return (
        <div className="flex flex-col h-full max-w-lg mx-auto bg-bg relative">
            {/* Main content */}
            <main className="flex-1 overflow-y-auto pb-20">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-40" aria-label="Main navigation">
                <div className="max-w-lg mx-auto bg-white border-t border-border shadow-card">
                    <div className="flex items-center justify-around h-16 px-2 relative">
                        {navItems.map((item) => {
                            if (item.isFab) {
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className="relative -mt-8 z-10"
                                        aria-label={item.label}
                                    >
                                        <div className="w-14 h-14 rounded-full bg-primary shadow-fab flex items-center justify-center ring-4 ring-white transition-transform active:scale-95">
                                            {item.icon(false)}
                                        </div>
                                    </NavLink>
                                );
                            }

                            const isActive = location.pathname === item.path;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors ${isActive ? 'text-primary' : 'text-text-muted'
                                        }`}
                                    aria-label={item.label}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    {item.icon(isActive)}
                                    <span className="text-[10px] font-medium">{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </div>
                </div>
            </nav>
        </div>
    );
}
