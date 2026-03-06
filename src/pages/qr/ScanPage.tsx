import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { useQrValidate, useQrRedeem } from '../../features/qr/hooks';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import { formatBalance } from '../../lib/format';
import { ROUTES } from '../../lib/constants';

type ScanState = 'scanning' | 'validating' | 'preview' | 'redeeming' | 'success' | 'error';

export default function ScanPage() {
    const navigate = useNavigate();
    const [state, setState] = useState<ScanState>('scanning');
    const [scannedCode, setScannedCode] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const scannerContainerId = 'qr-reader';

    const { data: qrData, isLoading: isValidating, error: validateError } = useQrValidate(
        state === 'validating' || state === 'preview' ? scannedCode : null,
    );
    const redeemMutation = useQrRedeem();

    // Start scanner
    const startScanner = useCallback(async () => {
        setState('scanning');
        setScannedCode(null);
        setErrorMsg('');

        try {
            // Small delay for DOM element to be available
            await new Promise((r) => setTimeout(r, 300));

            const scanner = new Html5Qrcode(scannerContainerId);
            scannerRef.current = scanner;

            await scanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    setScannedCode(decodedText);
                    setState('validating');
                    scanner.stop().catch(() => { });
                },
                () => { },
            );
        } catch {
            setErrorMsg('Camera access is required to scan QR codes');
            setState('error');
        }
    }, []);

    useEffect(() => {
        startScanner();
        return () => {
            scannerRef.current?.stop().catch(() => { });
        };
    }, [startScanner]);

    // Handle validation result
    useEffect(() => {
        if (state === 'validating' && qrData) setState('preview');
        if (state === 'validating' && validateError) {
            setErrorMsg((validateError as Error).message || 'Invalid QR code');
            setState('error');
        }
    }, [qrData, validateError, state]);

    const handleRedeem = async () => {
        if (!scannedCode) return;
        setState('redeeming');

        // Try to get location
        let lat: number | undefined;
        let lng: number | undefined;
        try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 }),
            );
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
        } catch {
            // Location optional
        }

        try {
            await redeemMutation.mutateAsync({
                code: scannedCode,
                latitude: lat,
                longitude: lng,
            });
            setState('success');
        } catch {
            setState('error');
            setErrorMsg('Failed to redeem QR code');
        }
    };

    return (
        <div className="px-4 pt-4 pb-6 min-h-screen">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center cursor-pointer"
                    aria-label="Go back"
                >
                    <svg className="w-5 h-5 text-text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold text-text-primary">Scan QR Code</h1>
            </div>

            {/* Scanner view */}
            {state === 'scanning' && (
                <div className="flex flex-col items-center">
                    <div className="w-full max-w-xs mx-auto rounded-2xl overflow-hidden bg-black mb-6">
                        <div id={scannerContainerId} className="w-full" />
                    </div>
                    <p className="text-sm text-text-muted text-center">
                        Point your camera at the QR code on the product
                    </p>
                </div>
            )}

            {/* Validating */}
            {(state === 'validating' && isValidating) && (
                <div className="flex flex-col items-center py-12">
                    <Loader />
                    <p className="mt-4 text-sm text-text-muted">Validating QR code...</p>
                </div>
            )}

            {/* Preview */}
            {state === 'preview' && qrData && (
                <div className="flex flex-col items-center">
                    <Card variant="gradient" padding="lg" className="w-full mb-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-primary-light" viewBox="0 0 24 24" fill="currentColor">
                                    <rect x="3" y="3" width="7" height="7" rx="1" />
                                    <rect x="14" y="3" width="7" height="7" rx="1" />
                                    <rect x="3" y="14" width="7" height="7" rx="1" />
                                    <rect x="14" y="14" width="4" height="4" />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-300 mb-1">{qrData.product.name}</p>
                            <p className="text-xs text-gray-400 mb-3">{qrData.product.category}</p>
                            <div className="flex items-baseline justify-center gap-2">
                                <span className="text-4xl font-bold">{formatBalance(qrData.points)}</span>
                                <span className="text-lg text-primary-light font-semibold">PTS</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Code: {qrData.code}</p>
                        </div>
                    </Card>

                    <div className="w-full space-y-3">
                        <Button onClick={handleRedeem} fullWidth size="lg" loading={redeemMutation.isPending}>
                            Confirm & Redeem
                        </Button>
                        <Button
                            onClick={() => startScanner()}
                            variant="outline"
                            fullWidth
                            size="lg"
                        >
                            Scan Another
                        </Button>
                    </div>
                </div>
            )}

            {/* Success */}
            {state === 'success' && redeemMutation.data && (
                <div className="flex flex-col items-center py-8">
                    <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-text-primary mb-1">Redeemed!</h2>
                    <p className="text-sm text-text-muted mb-6">Points added to your wallet</p>

                    <Card variant="gradient" padding="md" className="w-full mb-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-300 mb-1">Points Earned</p>
                            <p className="text-3xl font-bold text-primary-light">
                                +{formatBalance(redeemMutation.data.qr.points)}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                                New Balance: {formatBalance(redeemMutation.data.wallet.balance)} PTS
                            </p>
                        </div>
                    </Card>

                    <div className="w-full space-y-3">
                        <Button onClick={() => navigate(ROUTES.WALLET)} fullWidth size="lg">
                            View Wallet
                        </Button>
                        <Button onClick={() => startScanner()} variant="outline" fullWidth size="lg">
                            Scan Another
                        </Button>
                    </div>
                </div>
            )}

            {/* Error */}
            {state === 'error' && (
                <div className="flex flex-col items-center py-12">
                    <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold text-text-primary mb-1">Error</h2>
                    <p className="text-sm text-text-muted mb-6 text-center">{errorMsg}</p>
                    <Button onClick={() => startScanner()} fullWidth size="lg">
                        Try Again
                    </Button>
                </div>
            )}
        </div>
    );
}
