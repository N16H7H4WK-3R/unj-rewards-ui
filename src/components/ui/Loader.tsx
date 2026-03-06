export default function Loader({ className = '' }: { className?: string }) {
    return (
        <div className={`flex items-center justify-center ${className}`} role="status" aria-label="Loading">
            <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    );
}
