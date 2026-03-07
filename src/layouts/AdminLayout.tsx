import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../lib/constants';
import { getUsername, clearTokens } from '../services/auth';
import Button from '../components/ui/Button';

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const username = getUsername();

    // States for sidebar responsiveness
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        clearTokens();
        navigate(ROUTES.ADMIN_LOGIN);
    };

    const navItems = [
        {
            path: ROUTES.ADMIN_BULK_QR,
            label: 'Generate Bulk QRs',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
            )
        },
        {
            path: ROUTES.ADMIN_QR_CODES,
            label: 'QR Codes',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m-3.3 3.3L12 12l3.3-3.3M12 12V4m0 8l-3.3 3.3m3.3-3.3L15.3 15.3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
    ];

    return (
        <div className="flex h-screen bg-bg overflow-hidden">
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-border flex flex-col transition-all duration-300 transform 
                    lg:relative lg:translate-x-0 
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    ${isCollapsed ? 'lg:w-20' : 'lg:w-64 w-64'}`}
            >
                <div className={`p-6 border-b border-border flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    <h1 className={`text-xl font-bold text-primary transition-opacity duration-300 ${isCollapsed ? 'hidden lg:hidden' : 'block'}`}>
                        Admin
                    </h1>
                    <div className={`${isCollapsed ? 'block font-bold text-primary text-xl' : 'hidden'}`}>U</div>

                    {/* Desktop Collapse Toggle */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:flex items-center justify-center p-1.5 rounded-lg hover:bg-bg text-text-muted transition-colors"
                    >
                        <svg className={`w-5 h-5 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="lg:hidden p-2 text-text-muted hover:text-text-primary"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            title={isCollapsed ? item.label : undefined}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-primary/10 text-primary font-semibold shadow-sm'
                                    : 'text-text-muted hover:bg-bg hover:text-text-primary'
                                } ${isCollapsed ? 'justify-center px-2' : ''}`
                            }
                        >
                            <span className="flex-shrink-0">{item.icon}</span>
                            <span className={`whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'lg:hidden' : 'block'}`}>
                                {item.label}
                            </span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-border mt-auto">
                    {!isCollapsed && <p className="text-xs text-text-light text-center">UNJ Rewards v1.0</p>}
                    {isCollapsed && <p className="text-[10px] text-text-light text-center">v1.0</p>}
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Navbar */}
                <header className="h-16 bg-white border-b border-border px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-text-muted hover:text-text-primary hover:bg-bg rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <h2 className="text-base sm:text-lg font-medium text-text-primary line-clamp-1">
                            Welcome, <span className="font-bold text-primary">{username}</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" onClick={handleLogout} className="whitespace-nowrap px-3 sm:px-4">
                            Logout
                        </Button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-bg/50 scroll-smooth">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
