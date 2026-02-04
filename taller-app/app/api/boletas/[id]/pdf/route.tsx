export const runtime = 'nodejs';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  // 1. Buscar boleta
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

  // 2. Generar URL firmada (MEJOR que download)
  const { data, error: signError } = await supabase.storage
    .from('boletas')
    .createSignedUrl(boleta.pdf_path, 300);

  if (signError || !data?.signedUrl) {
    return new Response(
      JSON.stringify({ error: 'No se pudo generar URL del PDF' }),
      { status: 500 }
    );
  }

  // 3. Redireccionar al PDF
  return Response.redirect(data.signedUrl);
}
