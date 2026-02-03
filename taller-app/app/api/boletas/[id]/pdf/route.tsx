export const runtime = 'nodejs';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient();
  const { id } = context.params;

  // 1. Buscar boleta y su pdf_path
  const { data: boleta, error } = await supabase
    .from('boletas')
    .select('pdf_path')
    .eq('id', id)
    .single();

  if (error || !boleta?.pdf_path) {
    return new Response(
      JSON.stringify({ error: 'PDF no disponible para esta boleta' }),
      { status: 404 }
    );
  }

  // 2. Descargar PDF desde Storage
  const { data: file, error: fileError } = await supabase.storage
    .from('boletas')
    .download(boleta.pdf_path);

  if (fileError || !file) {
    return new Response(
      JSON.stringify({ error: 'No se pudo descargar el PDF' }),
      { status: 500 }
    );
  }

  // 3. Blob → ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // 4. Responder PDF
  return new Response(arrayBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="boleta-${id}.pdf"`,
    },
  });
}
