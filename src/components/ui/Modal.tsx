import { useEffect } from 'react';
import type { ReactNode } from 'react';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            {/* Content */}
            <div className="relative bg-white rounded-2xl shadow-card w-full max-w-sm p-6 animate-[scaleIn_0.2s_ease-out]">
                {title && (
                    <h2 className="text-lg font-bold text-text-primary mb-4">{title}</h2>
                )}
                {children}
            </div>
        </div>
    );
}
