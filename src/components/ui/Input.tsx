import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, className = '', id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-text-primary mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={`
            w-full px-4 py-3 rounded-xl border bg-white text-text-primary
            placeholder:text-text-light text-sm
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            ${error ? 'border-error' : 'border-border'}
            ${className}
          `}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                    {...props}
                />
                {error && (
                    <p id={`${inputId}-error`} className="mt-1 text-xs text-error" role="alert">
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p className="mt-1 text-xs text-text-muted">{helperText}</p>
                )}
            </div>
        );
    },
);

Input.displayName = 'Input';
export default Input;
