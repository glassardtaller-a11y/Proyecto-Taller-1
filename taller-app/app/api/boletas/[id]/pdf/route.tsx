export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient();
  const { id } = params;

  // 1. Buscar boleta
  const { data: boleta, error } = await supabase
    .from('boletas')
    .select('pdf_path')
    .eq('id', id)
    .single();

  if (error || !boleta || !boleta.pdf_path) {
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

  // 3. Devolver PDF
  return new Response(file, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="boleta.pdf"',
    },
  });
}

