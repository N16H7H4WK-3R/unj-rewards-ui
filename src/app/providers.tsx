import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '../components/ErrorBoundary';
import ToastContainer from '../components/ui/Toast';
import AppRouter from './router';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 30_000,
        },
        mutations: {
            retry: 0,
        },
    },
});

export default function App() {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <AppRouter />
                <ToastContainer />
            </QueryClientProvider>
        </ErrorBoundary>
    );
}
