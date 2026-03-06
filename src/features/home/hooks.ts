import { useQuery } from '@tanstack/react-query';
import { getHome } from './api';
import { queryKeys } from '../../lib/constants';

export function useHome() {
    return useQuery({
        queryKey: queryKeys.home(),
        queryFn: getHome,
        staleTime: 30_000,
        retry: 2,
    });
}
