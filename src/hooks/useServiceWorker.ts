import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { showToast } from '../components/ui/Toast';

export function useServiceWorker() {
    const [showUpdate, setShowUpdate] = useState(false);

    const {
        needRefresh: [needRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            if (r) {
                // Check for updates every hour
                setInterval(() => r.update(), 60 * 60 * 1000);
            }
        },
        onRegisterError(error) {
            console.error('SW registration error', error);
        },
    });

    useEffect(() => {
        if (needRefresh) {
            setShowUpdate(true);
            showToast('Update available — tap to refresh', 'info');
        }
    }, [needRefresh]);

    const applyUpdate = () => {
        updateServiceWorker(true);
        setShowUpdate(false);
    };

    return { showUpdate, applyUpdate };
}
