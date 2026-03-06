import Button from '../components/ui/Button';

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 text-center">
            <div className="w-20 h-20 bg-text-light/10 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728M5.636 5.636a9 9 0 000 12.728" />
                    <path strokeLinecap="round" d="M1 1l22 22" />
                </svg>
            </div>
            <h1 className="text-xl font-bold text-text-primary mb-2">You're Offline</h1>
            <p className="text-sm text-text-muted mb-6 max-w-xs">
                Please check your internet connection and try again.
            </p>
            <Button onClick={() => window.location.reload()} variant="primary" size="lg">
                Try Again
            </Button>
        </div>
    );
}
