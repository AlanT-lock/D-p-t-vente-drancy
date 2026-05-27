import { z } from 'zod';

const publicSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  BUSINESS_NAME: z.string().min(1),
  BUSINESS_PHONE: z.string().min(1),
  BUSINESS_ADDRESS: z.string().min(1),
  BUSINESS_LAT: z.coerce.number(),
  BUSINESS_LNG: z.coerce.number(),
  BUSINESS_HOURS_JSON: z.string(),
  GOOGLE_BUSINESS_URL: z.string().url(),
});

export const publicEnv = publicSchema.parse({
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  BUSINESS_NAME: process.env.NEXT_PUBLIC_BUSINESS_NAME,
  BUSINESS_PHONE: process.env.NEXT_PUBLIC_BUSINESS_PHONE,
  BUSINESS_ADDRESS: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS,
  BUSINESS_LAT: process.env.NEXT_PUBLIC_BUSINESS_LAT,
  BUSINESS_LNG: process.env.NEXT_PUBLIC_BUSINESS_LNG,
  BUSINESS_HOURS_JSON: process.env.NEXT_PUBLIC_BUSINESS_HOURS_JSON,
  GOOGLE_BUSINESS_URL: process.env.NEXT_PUBLIC_GOOGLE_BUSINESS_URL,
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  GOOGLE_PLACES_API_KEY: z.string().min(1),
  GOOGLE_PLACE_ID: z.string().min(1),
  CRON_SECRET: z.string().min(1),
  ADMIN_SLUG: z.string().min(1),
});

export function serverEnv() {
  return serverSchema.parse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,
    GOOGLE_PLACE_ID: process.env.GOOGLE_PLACE_ID,
    CRON_SECRET: process.env.CRON_SECRET,
    ADMIN_SLUG: process.env.ADMIN_SLUG,
  });
}
