import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'gradient';
    padding?: 'sm' | 'md' | 'lg';
}

const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
};

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ variant = 'default', padding = 'md', className = '', children, ...props }, ref) => {
        const baseClasses = 'rounded-2xl overflow-hidden';
        const variantClasses = variant === 'gradient'
            ? 'bg-gradient-to-br from-card-dark-start to-card-dark-end text-white shadow-card'
            : 'bg-surface shadow-soft';

        return (
            <div
                ref={ref}
                className={`${baseClasses} ${variantClasses} ${paddingClasses[padding]} ${className}`}
                {...props}
            >
                {children}
            </div>
        );
    },
);

Card.displayName = 'Card';
export default Card;
