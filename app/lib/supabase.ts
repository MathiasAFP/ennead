import { createClient } from "@supabase/supabase-js";

type SupabaseConfig = {
  url: string;
  publishableKey: string;
};

export function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Supabase não está configurado.");
  }

  return { url, publishableKey };
}

export function createSupabaseClient(config = getSupabaseConfig()) {
  return createClient(config.url, config.publishableKey);
}

export function getSupabaseHealthEndpoint(config = getSupabaseConfig()) {
  return new URL("/auth/v1/health", config.url).toString();
}
