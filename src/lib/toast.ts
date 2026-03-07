export type ToastType = 'success' | 'error' | 'info';

let addToastExternal: ((message: string, type?: ToastType) => void) | null = null;

export function showToast(message: string, type: ToastType = 'info') {
    addToastExternal?.(message, type);
}

export function setToastHandler(handler: ((message: string, type?: ToastType) => void) | null) {
    addToastExternal = handler;
}
