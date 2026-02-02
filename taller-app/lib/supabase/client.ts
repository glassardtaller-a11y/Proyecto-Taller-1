import { createBrowserClient } from '@supabase/ssr';

/**
 * Cliente Supabase para uso en componentes del lado del cliente (Client Components)
 * Este cliente usa las cookies del navegador para mantener la sesión
 */
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

/**
 * Exportación por conveniencia para uso directo
 * Nota: Cada llamada crea una nueva instancia, lo cual es intencional para SSR
 */
export const supabase = createClient();
