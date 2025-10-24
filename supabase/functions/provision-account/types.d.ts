// Minimal ambient types to satisfy IDE TypeScript in Node/Vite projects
// These are only for local type-checking and do not affect the Deno runtime.

declare const Deno: {
  env: { get(name: string): string | undefined };
};

declare module "https://deno.land/std@0.177.0/http/server.ts" {
  export type Handler = (req: Request) => Response | Promise<Response>;
  export function serve(handler: Handler): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  export interface SupabaseClient {
    from(table: string): any;
    auth: any;
  }
  export function createClient(url: string, key: string): SupabaseClient;
}
