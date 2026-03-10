import { useRef, forwardRef, useImperativeHandle, useMemo } from 'react';

interface PinInputProps {
    length: number;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    label?: string;
    type?: 'number' | 'text';
    boxCount?: number;
    charsPerBox?: number;
    disabled?: boolean;
    autoFocus?: boolean;
    className?: string;
}

export interface PinInputHandle {
    focus: () => void;
}

const PinInput = forwardRef<PinInputHandle, PinInputProps>(
    ({
        length,
        value,
        onChange,
        error,
        label,
        type = 'text',
        boxCount = length,
        charsPerBox = 1,
        disabled = false,
        autoFocus = false,
        className = '',
    }, ref) => {
        const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

        useImperativeHandle(ref, () => ({
            focus: () => {
                inputRefs.current[0]?.focus();
            },
        }));

        const values = useMemo(() => {
            const result: string[] = [];
            for (let i = 0; i < boxCount; i++) {
                result.push(value.slice(i * charsPerBox, (i + 1) * charsPerBox));
            }
            return result;
        }, [value, boxCount, charsPerBox]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
            const val = e.target.value;
            if (type === 'number' && val && !/^\d+$/.test(val)) return;

            const newValues = [...values];
            newValues[index] = val;
            const combined = newValues.join('');
            onChange(combined.slice(0, length));

            // Move to next box if filled
            if (val.length === charsPerBox && index < boxCount - 1) {
                inputRefs.current[index + 1]?.focus();
            }
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
            if (e.key === 'Backspace' && !values[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        };

        const handlePaste = (e: React.ClipboardEvent) => {
            e.preventDefault();
            const pastedText = e.clipboardData.getData('text').slice(0, length);
            if (type === 'number' && !/^\d+$/.test(pastedText)) return;
            onChange(pastedText);
        };

        return (
            <div className={`w-full ${className}`}>
                {label && (
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        {label}
                    </label>
                )}
                <div className="flex gap-2 items-center">
                    {Array.from({ length: boxCount }).map((_, i) => (
                        <input
                            key={i}
                            ref={(el) => {
                                if (inputRefs.current) {
                                    inputRefs.current[i] = el;
                                }
                            }}
                            type={type === 'number' ? 'tel' : 'text'}
                            value={values[i] || ''}
                            onChange={(e) => handleChange(e, i)}
                            onKeyDown={(e) => handleKeyDown(e, i)}
                            onPaste={handlePaste}
                            maxLength={charsPerBox}
                            disabled={disabled}
                            autoFocus={autoFocus && i === 0}
                            className={`
                                flex-1 h-12 text-center text-lg font-bold rounded-xl border
                                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                                transition-all duration-200
                                ${error ? 'border-error' : 'border-border'}
                                ${disabled ? 'bg-gray-50 text-text-muted' : 'bg-white text-text-primary'}
                            `}
                            style={{ minWidth: charsPerBox > 1 ? `${charsPerBox * 1.5}rem` : '2.5rem' }}
                        />
                    ))}
                </div>
                {error && (
                    <p className="mt-1 text-xs text-error" role="alert">
                        {error}
                    </p>
                )}
            </div>
        );
    },
);

PinInput.displayName = 'PinInput';
export default PinInput;
