import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import Button from './ui/Button';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-bg text-center">
                    <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold text-text-primary mb-2">Something went wrong</h2>
                    <p className="text-sm text-text-muted mb-6 max-w-xs">
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </p>
                    <Button onClick={this.handleRetry} variant="primary" size="md">
                        Try Again
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
