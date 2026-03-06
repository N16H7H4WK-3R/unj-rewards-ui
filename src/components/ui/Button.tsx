import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-primary text-white hover:bg-primary-dark active:bg-primary-dark shadow-sm',
    secondary: 'bg-card-dark-start text-white hover:bg-card-dark-end active:bg-card-dark-end',
    outline: 'border-2 border-primary text-primary bg-transparent hover:bg-primary/5 active:bg-primary/10',
    ghost: 'text-text-muted hover:bg-gray-100 active:bg-gray-200',
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', loading, fullWidth, className = '', disabled, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={`
          inline-flex items-center justify-center gap-2 font-semibold
          transition-all duration-200 cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
                {...props}
            >
                {loading && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                )}
                {children}
            </button>
        );
    },
);

Button.displayName = 'Button';
export default Button;
