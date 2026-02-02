'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';

export default function LoginPage() {
    const supabase = createClient();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError('Correo o contraseña incorrectos');
            setIsLoading(false);
            return;
        }

        // Login exitoso
        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {/* Background gradient orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-accent-orange/20 blur-[100px]" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent-violet/20 blur-[100px]" />
            </div>

            <div className="w-full max-w-md animate-fade-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-orange to-accent-amber mb-4">
                        <span className="text-white text-2xl font-bold">CT</span>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Control Taller</h1>
                    <p className="text-foreground-muted mt-1">Sistema de Asistencia y Pagos</p>
                </div>

                {/* Login Card */}
                <Card className="backdrop-blur-2xl">
                    <CardHeader className="text-center">
                        <CardTitle as="h2">Iniciar Sesión</CardTitle>
                        <CardDescription>Ingresa tus credenciales para continuar</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 rounded-lg bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-sm">
                                    {error}
                                </div>
                            )}

                            <Input
                                label="Correo electrónico"
                                type="email"
                                placeholder="usuario@taller.local"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <Input
                                label="Contraseña"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                isLoading={isLoading}
                                className="w-full"
                            >
                                Iniciar Sesión
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="text-center text-sm text-foreground-subtle mt-6">
                    © 2025 Control Taller. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
}
