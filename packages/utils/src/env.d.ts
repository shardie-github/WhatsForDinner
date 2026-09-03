/**
 * requireEnv helper - enforce environment variables
 */
export declare function requireEnv(key: string, defaultValue?: string): string;
export declare function requireEnvArray(keys: string[]): Record<string, string>;
export declare function optionalEnv(key: string, defaultValue?: string): string;
/**
 * Extract Supabase project reference from URL
 * @param supabaseUrl - The Supabase URL (e.g., https://<project-ref>.supabase.co)
 * @returns The project reference or null if invalid
 */
export declare function extractSupabaseProjectRef(supabaseUrl?: string): string | null;
/**
 * Get Supabase project reference from environment
 * Extracts from NEXT_PUBLIC_SUPABASE_URL or uses SUPABASE_PROJECT_REF
 * @returns The project reference or null if not found
 */
export declare function getSupabaseProjectRef(): string | null;
export declare function validateEnv(): void;
//# sourceMappingURL=env.d.ts.map