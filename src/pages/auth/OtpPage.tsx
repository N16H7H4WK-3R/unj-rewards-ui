import { useRef, useState, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVerifyOtp } from '../../features/auth/hooks';
import Button from '../../components/ui/Button';
import type { RequestFor } from '../../types/api';

const OTP_LENGTH = 4;

export default function OtpPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { username, token, requestFor } = (location.state as { username: string; token: string; requestFor: RequestFor }) || {};

    const verifyOtp = useVerifyOtp();
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Redirect if no state
    useEffect(() => {
        if (!username || !token) navigate('/auth/phone', { replace: true });
    }, [username, token, navigate]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        const newOtp = [...otp];
        text.split('').forEach((char, i) => { newOtp[i] = char; });
        setOtp(newOtp);
        const focusIdx = Math.min(text.length, OTP_LENGTH - 1);
        inputRefs.current[focusIdx]?.focus();
    };

    const otpValue = otp.join('');
    const isComplete = otpValue.length === OTP_LENGTH;

    const handleVerify = async () => {
        if (!isComplete || !token) return;
        try {
            const data = await verifyOtp.mutateAsync({
                role: 'technician',
                requestFor: requestFor || 'login',
                data: { username: token, password: otpValue },
            });

            if (!data.user_role || data.user_role === 'null') {
                navigate('/role/select', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        } catch {
            // Error handled by hook
        }
    };

    if (!username || !token) return null;

    return (
        <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6">
            <button
                onClick={() => navigate(-1)}
                className="self-start mb-8 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                aria-label="Go back"
            >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <div className="w-full max-w-sm">
                <h1 className="text-2xl font-bold text-text-primary mb-2">Verify OTP</h1>
                <p className="text-sm text-text-muted mb-8">
                    Enter the 6-digit code sent to <span className="font-semibold text-text-primary">+91 {username}</span>
                </p>

                {/* OTP Inputs */}
                <div className="flex gap-3 mb-8 justify-center" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => { inputRefs.current[index] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className={`
                w-12 h-14 text-center text-lg font-bold rounded-xl border-2
                transition-all duration-200 bg-white
                focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                ${digit ? 'border-primary' : 'border-border'}
              `}
                            aria-label={`OTP digit ${index + 1}`}
                        />
                    ))}
                </div>

                <Button
                    onClick={handleVerify}
                    fullWidth
                    size="lg"
                    loading={verifyOtp.isPending}
                    disabled={!isComplete}
                >
                    Verify & Continue
                </Button>

                <p className="mt-6 text-center text-sm text-text-muted">
                    Didn't receive OTP?{' '}
                    <button className="text-primary font-medium hover:underline cursor-pointer">
                        Resend
                    </button>
                </p>
            </div>
        </div>
    );
}
