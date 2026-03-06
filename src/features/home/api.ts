import { apiClient } from '../../services/apiClient';
import type { HomeData } from '../../types/api';

export function getHome() {
    return apiClient<HomeData>('/api/v1/home');
}
