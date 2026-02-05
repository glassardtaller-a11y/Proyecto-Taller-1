export const runtime = 'nodejs';

import { createClient } from '@supabase/supabase-js';
import { generateBoletaPDF } from '@/lib/supabase/pdf/boleta';

const supabaseService = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    const { data: boleta } = await supabaseService
        .from('boletas')
        .select(`
      id,
      empleado_id,
      total_produccion,
      total_neto,
      empleado:empleados(nombre, codigo),
      ciclo:ciclos(fecha_inicio, fecha_fin)
    `)
        .eq('id', id)
        .single();

    if (!boleta || !boleta.empleado || !boleta.ciclo) {
        return new Response(
            JSON.stringify({ error: 'Datos incompletos para generar boleta' }),
            { status: 400 }
        );
    }

    const { ciclo, empleado } = boleta;
    const { fecha_inicio, fecha_fin } = ciclo as any;

    const { data: producciones } = await supabaseService
        .from('produccion')
        .select('subtotal, tipos_trabajo(nombre, descripcion)')
        .eq('empleado_id', boleta.empleado_id)
        .gte('fecha', fecha_inicio)
        .lte('fecha', fecha_fin);

    const { data: movimientos } = await supabaseService
        .from('movimientos')
        .select('tipo, monto, signo')
        .eq('empleado_id', boleta.empleado_id)
        .gte('fecha', fecha_inicio)
        .lte('fecha', fecha_fin);

    const pdfBuffer = await generateBoletaPDF({
        boleta,
        empleado,
        ciclo,
        producciones: producciones ?? [],
        movimientos: movimientos ?? [],
    });

    const pdfPath = `boletas/${boleta.id}.pdf`;

    await supabaseService.storage
        .from('boletas')
        .upload(pdfPath, pdfBuffer, {
            contentType: 'application/pdf',
            upsert: true,
        });

    await supabaseService
        .from('boletas')
        .update({ pdf_path: pdfPath })
        .eq('id', boleta.id);

    return new Response(
        JSON.stringify({ ok: true, pdf_path: pdfPath }),
        { status: 200 }
    );
}
