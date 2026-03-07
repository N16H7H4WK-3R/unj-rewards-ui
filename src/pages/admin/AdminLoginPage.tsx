import AdminLoginForm from '../../features/auth/AdminLoginForm';

export default function AdminLoginPage() {
    return (
        <div className="min-h-screen bg-bg flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-text-primary mb-2">Admin Portal</h1>
                <p className="text-sm text-text-muted mb-8 text-center">
                    Enter your credentials to access the admin dashboard
                </p>

                <AdminLoginForm />
            </div>

            <div className="py-4 text-center">
                <p className="text-xs text-text-light">Powered by UNJ Digital</p>
            </div>
        </div>
    );
}
