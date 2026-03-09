import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { useQrRedeem, useQrProcess } from '../../features/qr/hooks';
import type { QRProcessResponse, QRValidateResponse, QRRedeemResponse } from '../../types/api';
import { ApiError } from '../../services/apiClient';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import { formatBalance } from '../../lib/format';
import { ROUTES } from '../../lib/constants';
import { config } from '../../lib/config';

type ScanState = 'initializing' | 'scanning' | 'validating' | 'preview' | 'redeeming' | 'success' | 'error';

const scannerContainerId = 'qr-reader';

function getErrorMessage(err: unknown, fallback: string): string {
    if (err instanceof ApiError && err.message) return err.message;
    if (err instanceof Error && err.message) return err.message;
    return fallback;
}

function normalizeProcessResponse(response: QRProcessResponse): {
    details: QRValidateResponse | null;
    resolvedPublicCode: string | null;
} {
    if ('qr' in response && response.qr) {
        return {
            details: response.qr,
            resolvedPublicCode: response.public_code ?? response.qr.public_code ?? null,
        };
    }

    // Flat response (same shape as QRValidateResponse)
    const flat = response as QRValidateResponse;
    return {
        details: flat,
        resolvedPublicCode: flat.public_code ?? null,
    };
}

export default function ScanPage() {
    const navigate = useNavigate();
    const { appCodeAlgoVersion, qrCode } = useParams<{ appCodeAlgoVersion?: string; qrCode?: string }>();

    const [state, setState] = useState<ScanState>(appCodeAlgoVersion && qrCode ? 'validating' : 'scanning');
    const [errorMsg, setErrorMsg] = useState('');
    const [publicCode, setPublicCode] = useState<string | null>(null);
    const [qrDetails, setQrDetails] = useState<QRValidateResponse | null>(null);
    const [redeemResult, setRedeemResult] = useState<QRRedeemResponse | null>(null);
    const [countdown, setCountdown] = useState(5);

    const { mutateAsync: processQr } = useQrProcess();
    const { mutateAsync: redeemQr } = useQrRedeem();

    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isMountedRef = useRef(false);
    const isStartingRef = useRef(false);
    const hasScannedRef = useRef(false);
    const redeemTriggeredRef = useRef(false);
    const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const scannerDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const setErrorState = useCallback((message: string) => {
        if (!isMountedRef.current) return;
        setErrorMsg(message);
        setState('error');
    }, []);

    const validateQrFormat = useCallback((text: string) => {
        try {
            let cleanText = text.trim();
            if (cleanText.includes('://')) {
                const url = new URL(cleanText);
                cleanText = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
            } else if (cleanText.includes(config.qrUrlPrefix)) {
                cleanText = cleanText.split(config.qrUrlPrefix).pop() || '';
            }

            const parts = cleanText.split('/');
            if (parts.length === 2 && parts[0].length >= 2 && parts[1].length >= 2) {
                return cleanText;
            }
        } catch {
            return null;
        }

        return null;
    }, []);

    const cleanupScanner = useCallback(async () => {
        const scanner = scannerRef.current;
        if (!scanner) return;

        try {
            await scanner.stop();
        } catch {
            // ignore stop failures when scanner is not running
        }

        try {
            await scanner.clear();
        } catch {
            // ignore clear failures when scanner is already disposed
        }

        if (scannerRef.current === scanner) {
            scannerRef.current = null;
        }
    }, []);

    const handleProcessQr = useCallback(async (code: string) => {
        if (!isMountedRef.current) return;

        setErrorMsg('');
        setState('validating');

        try {
            const response = await processQr(code);
            const { details, resolvedPublicCode } = normalizeProcessResponse(response);

            if (!details || !details.product || !details.product.name || !details.product.category || !resolvedPublicCode) {
                throw new Error('Unable to read QR details. Please scan again.');
            }

            if (!isMountedRef.current) return;
            setPublicCode(resolvedPublicCode);
            setQrDetails(details);
            setCountdown(5);
            redeemTriggeredRef.current = false;
            setState('preview');
        } catch (err: unknown) {
            setErrorState(getErrorMessage(err, 'Invalid or expired QR code'));
        }
    }, [processQr, setErrorState]);

    const startScanner = useCallback(async () => {
        if (!isMountedRef.current || isStartingRef.current) return;
        isStartingRef.current = true;

        redeemTriggeredRef.current = false;
        hasScannedRef.current = false;

        setState('initializing');
        setPublicCode(null);
        setQrDetails(null);
        setErrorMsg('');
        setCountdown(5);

        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }

        if (scannerDelayRef.current) {
            clearTimeout(scannerDelayRef.current);
            scannerDelayRef.current = null;
        }

        await cleanupScanner();

        if (!isMountedRef.current) {
            isStartingRef.current = false;
            return;
        }

        // Small delay to ensure container is ready and scanner is fully stopped
        await new Promise<void>((resolve) => {
            scannerDelayRef.current = setTimeout(() => resolve(), 300);
        });

        if (!isMountedRef.current) {
            isStartingRef.current = false;
            return;
        }

        try {
            // Check if element exists before starting
            const element = document.getElementById(scannerContainerId);
            if (!element) throw new Error('Scanner container not found');

            const scanner = new Html5Qrcode(scannerContainerId);
            scannerRef.current = scanner;

            await scanner.start(
                { facingMode: 'environment' },
                { 
                    fps: 10, 
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0 
                },
                (decodedText) => {
                    if (hasScannedRef.current) return;

                    const validCode = validateQrFormat(decodedText);
                    if (!validCode) return;

                    hasScannedRef.current = true;
                    void cleanupScanner();
                    void handleProcessQr(validCode);
                },
                () => { /* ignore per-frame decode errors */ },
            );

            if (isMountedRef.current) {
                setState('scanning');
            }
        } catch (err) {
            console.error('Scanner start error:', err);
            setErrorState('Camera access is required to scan QR codes');
        } finally {
            isStartingRef.current = false;
        }
    }, [cleanupScanner, handleProcessQr, setErrorState, validateQrFormat]);

    const handleRedeem = useCallback(async () => {
        if (redeemTriggeredRef.current) return;

        if (!publicCode) {
            setErrorState('Unable to redeem this QR code. Please scan again.');
            return;
        }

        redeemTriggeredRef.current = true;

        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }

        if (isMountedRef.current) {
            setState('redeeming');
        }

        let lat: number | undefined;
        let lng: number | undefined;

        if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
            try {
                const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        timeout: 5000,
                        enableHighAccuracy: true,
                    });
                });

                lat = pos.coords.latitude;
                lng = pos.coords.longitude;
            } catch {
                // geolocation is optional for redeem
            }
        }

        try {
            const result = await redeemQr({
                public_code: publicCode,
                latitude: Number(lat?.toFixed(6)),
                longitude: Number(lng?.toFixed(6)),
            });

            if (!isMountedRef.current) return;
            setRedeemResult(result);
            setState('success');
        } catch (err: unknown) {
            redeemTriggeredRef.current = false;
            setErrorState(getErrorMessage(err, 'Failed to redeem QR code. It might have already been used.'));
        }
    }, [publicCode, redeemQr, setErrorState]);

    useEffect(() => {
        if (state !== 'preview') {
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
            }
            return;
        }

        if (!qrDetails || !qrDetails.product || !publicCode) {
            setErrorState('Unable to continue because QR details are missing. Please scan again.');
            return;
        }

        redeemTriggeredRef.current = false;
        setCountdown(5);

        countdownIntervalRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    if (countdownIntervalRef.current) {
                        clearInterval(countdownIntervalRef.current);
                        countdownIntervalRef.current = null;
                    }
                    void handleRedeem();
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => {
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
            }
        };
    }, [state, qrDetails, publicCode, handleRedeem, setErrorState]);

    useEffect(() => {
        isMountedRef.current = true;

        if (appCodeAlgoVersion && qrCode) {
            void handleProcessQr(`${appCodeAlgoVersion}/${qrCode}`);
        } else {
            void startScanner();
        }

        return () => {
            isMountedRef.current = false;

            if (scannerDelayRef.current) {
                clearTimeout(scannerDelayRef.current);
                scannerDelayRef.current = null;
            }

            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
            }

            void cleanupScanner();
        };
    }, [appCodeAlgoVersion, qrCode, handleProcessQr, startScanner, cleanupScanner]);

    const product = qrDetails?.product;

    return (
        <div className="px-4 pt-4 pb-6 min-h-screen max-w-lg mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate(ROUTES.HOME)}
                    className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                    aria-label="Go home"
                >
                    <svg className="w-5 h-5 text-text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-2xl font-bold text-text-primary">Scan QR</h1>
            </div>

            {(state === 'scanning' || state === 'initializing') && (
                <div className="flex flex-col items-center">
                    <div className="w-full aspect-square max-w-[320px] mx-auto rounded-3xl overflow-hidden bg-black mb-8 shadow-2xl relative border-4 border-white/20">
                        <div 
                            id={scannerContainerId} 
                            className="!w-full !h-full [&_video]:!w-full [&_video]:!h-full [&_video]:!object-cover" 
                        />
                        {state === 'initializing' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                                <Loader className="w-12 h-12" />
                                <p className="text-white text-xs font-bold uppercase tracking-widest mt-4 animate-pulse">Initializing Camera...</p>
                            </div>
                        )}
                        {state === 'scanning' && (
                            <div className="absolute inset-0 border-2 border-primary/30 pointer-events-none rounded-2xl m-8 animate-pulse" />
                        )}
                    </div>
                    <div className="bg-white/50 backdrop-blur-md p-4 rounded-2xl text-center shadow-soft w-full">
                        <p className="text-sm font-medium text-text-primary mb-1">
                            {state === 'initializing' ? 'Getting ready...' : 'Align QR code within the frame'}
                        </p>
                        <p className="text-xs text-text-muted">
                            {state === 'initializing' ? 'Please allow camera access' : 'Scanning starts automatically'}
                        </p>
                    </div>
                </div>
            )}

            {state === 'validating' && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="relative">
                        <Loader className="w-16 h-16" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-6 h-6 text-primary animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                    </div>
                    <p className="mt-6 text-lg font-semibold text-text-primary">Checking QR code...</p>
                    <p className="text-sm text-text-muted mt-1 italic">Please don't close this page</p>
                </div>
            )}

            {(state === 'preview' || state === 'redeeming') && product && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card variant="gradient" padding="lg" className="w-full mb-8 relative overflow-hidden group">
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
                        <div className="relative z-10 text-center">
                            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm shadow-xl border border-white/30 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">{product.name}</h2>
                            <p className="text-primary-light font-medium bg-white/10 inline-block px-3 py-1 rounded-full text-xs mb-6 backdrop-blur-md">
                                {product.category}
                            </p>

                            <div className="flex items-center justify-center gap-3">
                                <span className="text-6xl font-black text-white tracking-tight">{formatBalance(qrDetails.points)}</span>
                                <div className="text-left leading-none">
                                    <span className="block text-lg font-black text-primary-light">PTS</span>
                                    <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Rewards</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10">
                                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Serial Number</p>
                                <p className="text-sm font-mono text-white/80">{qrDetails.public_code || publicCode}</p>
                            </div>
                        </div>
                    </Card>

                    <div className="space-y-4">
                        <div className="text-center mb-2">
                            <p className="text-sm font-medium text-text-primary">Redeeming Points to Wallet..</p>
                        </div>
                        <Button
                            fullWidth
                            size="lg"
                            loading={true}
                            className="shadow-lg shadow-primary/20 h-16 text-lg"
                        >
                            Continue to wallet ({countdown}s)
                        </Button>
                        <Button
                            onClick={() => {
                                void startScanner();
                            }}
                            variant="ghost"
                            fullWidth
                            size="lg"
                            className="text-text-muted hover:text-text-primary relative z-10"
                            disabled={state === 'redeeming'}
                        >
                            Cancel & Scan Again
                        </Button>
                    </div>
                </div>
            )}

            {state === 'success' && redeemResult && (
                <div className="flex flex-col items-center py-6 animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mb-6 relative">
                        <div className="absolute inset-0 bg-success/20 rounded-full animate-ping" />
                        <svg className="w-12 h-12 text-success relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-black text-text-primary mb-2 text-center">Boom! Rewarded</h2>
                    <p className="text-text-muted mb-10 text-center max-w-[250px]">Your points have been added to your wallet successfully</p>

                    <Card variant="default" padding="lg" className="w-full mb-10 bg-success/5 border-success/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold mb-1">Earned Points</p>
                                <p className="text-3xl font-black text-success">+{formatBalance(redeemResult.qr.points)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold mb-1">New Balance</p>
                                <p className="text-xl font-bold text-text-primary">{formatBalance(redeemResult.wallet.balance)} PTS</p>
                            </div>
                        </div>
                    </Card>

                    <div className="w-full space-y-4">
                        <Button onClick={() => navigate(ROUTES.WALLET)} fullWidth size="lg" className="h-16 text-lg">
                            Go to Wallet
                        </Button>
                        <Button
                            onClick={() => {
                                void startScanner();
                            }}
                            variant="outline"
                            fullWidth
                            size="lg"
                        >
                            Scan Another
                        </Button>
                    </div>
                </div>
            )}

            {state === 'error' && (
                <div className="flex flex-col items-center py-12 animate-in fade-in duration-500 px-4 text-center">
                    <div className="w-20 h-20 bg-error/10 rounded-3xl flex items-center justify-center mb-8 rotate-12">
                        <svg className="w-10 h-10 text-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary mb-3">Scan Failed</h2>
                    <p className="text-text-muted mb-10 max-w-[280px]">{errorMsg || 'Something went wrong while processing the QR code.'}</p>

                    <div className="w-full space-y-4">
                        <Button
                            onClick={() => {
                                void startScanner();
                            }}
                            fullWidth
                            size="lg"
                            className="h-16 shadow-lg shadow-error/10"
                        >
                            Try Again
                        </Button>
                        <Button
                            onClick={() => navigate(ROUTES.HOME)}
                            variant="ghost"
                            fullWidth
                            className="text-text-muted"
                        >
                            Return Home
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
