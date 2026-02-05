export const runtime = 'nodejs';

import { createClient } from '@supabase/supabase-js';
import { generateBoletaVentaPDF } from '@/lib/supabase/pdf/boletaVenta';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    // 1. Traer boleta
    const { data: boleta } = await supabase
        .from('ventas_boletas')
        .select('*')
        .eq('id', id)
        .single();

    if (!boleta) {
        return new Response('Boleta no encontrada', { status: 404 });
    }

    // 2. Traer detalle
    const { data: detalle } = await supabase
        .from('ventas_boletas_detalle')
        .select('*')
        .eq('boleta_id', id);

    // 3. Generar PDF
    const pdfBuffer = await generateBoletaVentaPDF({
        boleta,
        detalles: detalle || []
    });

    // 4. Retornar PDF directo
    return new Response(
        new Uint8Array(pdfBuffer),
        {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename=boleta-${id}.pdf`
            }
        }
    );

}
