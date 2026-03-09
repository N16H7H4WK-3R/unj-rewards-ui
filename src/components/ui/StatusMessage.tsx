import { useEffect, type FC } from 'react';

interface StatusMessageProps {
    type: 'error' | 'success';
    message: string | null;
    onDismiss?: () => void;
    autoDismiss?: boolean;
    duration?: number;
}

const StatusMessage: FC<StatusMessageProps> = ({
    type,
    message,
    onDismiss,
    autoDismiss = false,
    duration = 5000
}) => {
    useEffect(() => {
        if (message && autoDismiss && onDismiss) {
            const timer = setTimeout(() => {
                onDismiss();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [message, autoDismiss, onDismiss, duration]);

    if (!message) return null;

    return (
        <div
            className={`
                mt-4 p-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-300
                ${type === 'error'
                    ? 'bg-error/10 text-error border border-error/20'
                    : 'bg-success/10 text-success border border-success/20'}
                relative pr-10
            `}
            id={`${type}-message`}
        >
            <div className="flex items-center gap-2">
                {type === 'error' ? (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                )}
                <span>{message}</span>
            </div>
            {onDismiss && (
                <button
                    type="button"
                    onClick={onDismiss}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
                    aria-label="Dismiss"
                >
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default StatusMessage;
