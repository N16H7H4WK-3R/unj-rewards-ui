import { useCallback } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { showToast } from '../lib/toast';

export function useServiceWorker() {
    const {
        needRefresh: [needRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            if (r) {
                setInterval(() => r.update(), 60 * 60 * 1000);
            }
        },
        onNeedRefresh() {
            showToast('Update available — tap to refresh', 'info');
        },
        onRegisterError(error) {
            console.error('SW registration error', error);
        },
    });

    const applyUpdate = useCallback(() => {
        updateServiceWorker(true);
    }, [updateServiceWorker]);

    return { showUpdate: needRefresh, applyUpdate };
}
