export function formatPoints(value: string | number): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0';
    return num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }) + ' • ' + date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

export function formatBalance(balance: string | number): string {
    const num = typeof balance === 'string' ? parseFloat(balance) : balance;
    if (isNaN(num)) return '0';
    return num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}
