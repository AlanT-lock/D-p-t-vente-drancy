import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { publicEnv, serverEnv } from '@/lib/env';

export function createAdminClient() {
  return createClient<Database>(publicEnv.SUPABASE_URL, serverEnv().SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
