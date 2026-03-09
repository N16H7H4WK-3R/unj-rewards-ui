import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url('VITE_API_BASE_URL must be a valid URL'),
  VITE_QR_URL_PREFIX: z.string().min(1, 'VITE_QR_URL_PREFIX is required'),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const config = {
  apiBaseUrl: parsed.data.VITE_API_BASE_URL,
  qrUrlPrefix: parsed.data.VITE_QR_URL_PREFIX,
} as const;
