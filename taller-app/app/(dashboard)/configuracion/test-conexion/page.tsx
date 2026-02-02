'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { StatusBadge } from '@/components/ui';

interface ConnectionStatus {
    connected: boolean;
    message: string;
    timestamp: string;
    details?: {
        url: string;
        hasAnonKey: boolean;
    };
}

export default function TestConnectionPage() {
    const [status, setStatus] = useState<ConnectionStatus | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const testConnection = async () => {
        setIsLoading(true);
        setStatus(null);

        try {
            const supabase = createClient();

            // Verificar que las variables de entorno estén configuradas
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

            if (!url || url === 'your_supabase_url_here') {
                setStatus({
                    connected: false,
                    message: 'Las variables de entorno no están configuradas. Crea el archivo .env.local con tus credenciales de Supabase.',
                    timestamp: new Date().toISOString(),
                    details: {
                        url: url || 'No configurada',
                        hasAnonKey: false,
                    },
                });
                setIsLoading(false);
                return;
            }

            // Intentar una consulta simple para verificar la conexión
            // Usamos una tabla del sistema que siempre existe
            const { error } = await supabase.auth.getSession();

            if (error) {
                setStatus({
                    connected: false,
                    message: `Error de conexión: ${error.message}`,
                    timestamp: new Date().toISOString(),
                    details: {
                        url: url.replace(/https?:\/\//, '').split('.')[0] + '...',
                        hasAnonKey,
                    },
                });
            } else {
                setStatus({
                    connected: true,
                    message: '¡Conexión exitosa a Supabase!',
                    timestamp: new Date().toISOString(),
                    details: {
                        url: url.replace(/https?:\/\//, '').split('.')[0] + '...',
                        hasAnonKey,
                    },
                });
            }
        } catch (err) {
            setStatus({
                connected: false,
                message: `Error inesperado: ${err instanceof Error ? err.message : 'Error desconocido'}`,
                timestamp: new Date().toISOString(),
            });
        }

        setIsLoading(false);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Test de Conexión</h1>
                <p className="text-foreground-muted mt-1">
                    Verificar la conexión con Supabase
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Estado de la Conexión</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button onClick={testConnection} isLoading={isLoading}>
                            {isLoading ? 'Verificando...' : 'Probar Conexión'}
                        </Button>
                    </div>

                    {status && (
                        <div className={`p-4 rounded-lg border ${status.connected
                                ? 'bg-accent-emerald/10 border-accent-emerald/20'
                                : 'bg-accent-rose/10 border-accent-rose/20'
                            }`}>
                            <div className="flex items-center gap-2 mb-2">
                                <StatusBadge status={status.connected ? 'ACTIVO' : 'INACTIVO'} />
                                <span className="text-sm text-foreground-muted">
                                    {new Date(status.timestamp).toLocaleTimeString()}
                                </span>
                            </div>

                            <p className={`text-sm font-medium ${status.connected ? 'text-accent-emerald' : 'text-accent-rose'
                                }`}>
                                {status.message}
                            </p>

                            {status.details && (
                                <div className="mt-3 pt-3 border-t border-glass-border">
                                    <p className="text-xs text-foreground-muted">
                                        <span className="font-medium">URL:</span> {status.details.url}
                                    </p>
                                    <p className="text-xs text-foreground-muted">
                                        <span className="font-medium">Anon Key:</span>{' '}
                                        {status.details.hasAnonKey ? '✓ Configurada' : '✗ No configurada'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="p-4 rounded-lg bg-glass border border-glass-border">
                        <h4 className="font-medium text-foreground mb-2">📋 Instrucciones</h4>
                        <ol className="text-sm text-foreground-muted space-y-2 list-decimal list-inside">
                            <li>Ve a <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-accent-orange hover:underline">supabase.com/dashboard</a></li>
                            <li>Crea un nuevo proyecto o selecciona uno existente</li>
                            <li>Ve a Settings → API</li>
                            <li>Copia la <strong>Project URL</strong> y la <strong>anon public key</strong></li>
                            <li>Crea el archivo <code className="px-1 py-0.5 rounded bg-glass-active text-foreground">.env.local</code> en la raíz del proyecto</li>
                            <li>Añade las variables:
                                <pre className="mt-2 p-3 rounded-lg bg-background-secondary text-xs overflow-x-auto">
                                    {`NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui`}
                                </pre>
                            </li>
                            <li>Reinicia el servidor de desarrollo</li>
                        </ol>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
