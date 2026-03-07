import { useEffect, useState, useCallback } from 'react';
import { setToastHandler } from '../../lib/toast';
import type { ToastType } from '../../lib/toast';

interface ToastState {
    message: string;
    type: ToastType;
    id: number;
}

let toastIdCounter = 0;

const typeStyles: Record<ToastType, string> = {
    success: 'bg-success text-white',
    error: 'bg-error text-white',
    info: 'bg-card-dark-start text-white',
};

const typeIcons: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
};

export default function ToastContainer() {
    const [toasts, setToasts] = useState<ToastState[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = ++toastIdCounter;
        setToasts((prev) => [...prev, { message, type, id }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    useEffect(() => {
        setToastHandler(addToast);
        return () => { setToastHandler(null); };
    }, [addToast]);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[90%] max-w-sm" role="status" aria-live="polite">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`
            ${typeStyles[toast.type]}
            px-4 py-3 rounded-xl shadow-card flex items-center gap-3
            animate-[slideDown_0.3s_ease-out]
            text-sm font-medium
          `}
                >
                    <span className="text-base flex-shrink-0">{typeIcons[toast.type]}</span>
                    <span className="flex-1">{toast.message}</span>
                </div>
            ))}
        </div>
    );
}
