export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateBoletaPDF } from '@/lib/supabase/pdf/boleta';

const supabaseService = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    const boletaId = params.id;

    // 1. Obtener boleta + relaciones
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
        .eq('id', boletaId)
        .single();

    if (!boleta || !boleta.empleado || !boleta.ciclo) {
        return new Response(
            JSON.stringify({ error: 'Datos incompletos para generar boleta' }),
            { status: 400 }
        );
    }

    // 🔑 REUTILIZAMOS EXACTO LO QUE YA ESTÁ VERDE
    const ciclo: any = boleta.ciclo;
    const empleado: any = boleta.empleado;

    const fecha_inicio = ciclo.fecha_inicio;
    const fecha_fin = ciclo.fecha_fin;

    // 2. Producciones
    const { data: producciones } = await supabaseService
        .from('produccion')
        .select('subtotal, tipo_trabajo(nombre)')
        .eq('empleado_id', boleta.empleado_id)
        .gte('fecha', fecha_inicio)
        .lte('fecha', fecha_fin);

    // 3. Movimientos
    const { data: movimientos } = await supabaseService
        .from('movimientos')
        .select('tipo, monto, signo')
        .eq('empleado_id', boleta.empleado_id)
        .gte('fecha', fecha_inicio)
        .lte('fecha', fecha_fin);

    // 4. Generar PDF
    const pdfBuffer = await generateBoletaPDF({
        boleta,
        empleado,
        ciclo,
        producciones: producciones ?? [],
        movimientos: movimientos ?? [],
    });

    // 5. Subir a Storage
    const pdfPath = `boletas/${boleta.id}.pdf`;

    await supabaseService.storage
        .from('boletas')
        .upload(pdfPath, pdfBuffer, {
            contentType: 'application/pdf',
            upsert: true,
        });

    // 6. Guardar path
    await supabaseService
        .from('boletas')
        .update({ pdf_path: pdfPath })
        .eq('id', boleta.id);

    return new Response(
        JSON.stringify({ ok: true, pdf_path: pdfPath }),
        { status: 200 }
    );
}
