import { createClient } from '@supabase/supabase-js';

export const supabaseService = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

import { generateBoletaPDF } from '@/lib/supabase/pdf/boleta';
export async function cerrarYCobrarCiclo(cicloId: string) {
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
        .eq('ciclo_id', cicloId)
        .single();

    if (!boleta || !boleta.empleado || !boleta.ciclo) {
        throw new Error('Datos incompletos para generar boleta');
    }

    const ciclo: any = boleta.ciclo;
    const empleado: any = boleta.empleado;

    const fecha_inicio = ciclo.fecha_inicio;
    const fecha_fin = ciclo.fecha_fin;


    // 2. Obtener producciones
    const { data: producciones } = await supabaseService
        .from('produccion')
        .select('subtotal, tipos_trabajo(nombre, descripcion)')
        .eq('empleado_id', boleta.empleado_id)
        .gte('fecha', fecha_inicio)
        .lte('fecha', fecha_fin);



    // 3. Obtener movimientos
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

    // 6. Guardar path y cerrar ciclo
    await supabaseService
        .from('boletas')
        .update({ pdf_path: pdfPath, pagado: true })
        .eq('id', boleta.id);

    await supabaseService
        .from('ciclos')
        .update({ estado: 'CERRADO' })
        .eq('id', cicloId);
}
