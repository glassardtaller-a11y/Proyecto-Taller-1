export const runtime = 'nodejs';

import { cerrarYCobrarCiclo } from '@/lib/supabase/service';

export async function POST(req: Request) {
    try {
        const { cicloId } = await req.json();

        if (!cicloId) {
            return Response.json({ error: 'cicloId requerido' }, { status: 400 });
        }

        await cerrarYCobrarCiclo(cicloId);

        return Response.json({ ok: true });

    } catch (error) {
        console.error(error);
        return Response.json(
            { error: 'Error al cerrar ciclo y generar PDF' },
            { status: 500 }
        );
    }
}
