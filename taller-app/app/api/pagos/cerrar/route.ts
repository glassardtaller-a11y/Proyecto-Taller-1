import { NextResponse } from 'next/server';
import { cerrarYCobrarCiclo } from '@/lib/supabase/service';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { cicloId } = body;

        if (!cicloId) {
            return NextResponse.json(
                { error: 'cicloId requerido' },
                { status: 400 }
            );
        }

        await cerrarYCobrarCiclo(cicloId);

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        console.error('Error cerrar ciclo:', error);

        return NextResponse.json(
            { error: error?.message || 'Error al cerrar ciclo' },
            { status: 500 }
        );
    }
}
