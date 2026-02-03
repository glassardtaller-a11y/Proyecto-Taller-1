export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer';

/* =======================
   STYLES (58mm ticket)
======================= */
const styles = StyleSheet.create({
  page: {
    width: 164,
    padding: 8,
    fontSize: 8,
    fontFamily: 'Helvetica',
  },
  center: { textAlign: 'center' },
  bold: { fontWeight: 'bold' },
  line: {
    borderBottom: '1 solid #000',
    marginVertical: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

/* =======================
   PDF COMPONENT
======================= */
function BoletaPDF({
  boleta,
  empleado,
  ciclo,
  producciones,
  movimientos,
}: any) {
  const formatMoney = (n: number) => `S/. ${Number(n).toFixed(2)}`;
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-PE');

  return (
    <Document>
      <Page size={[164, 'auto']} style={styles.page}>
        <Text style={[styles.center, styles.bold]}>TALLER</Text>
        <Text style={[styles.center, styles.bold]}>BOLETA DE PAGO</Text>
        <View style={styles.line} />

        <View style={styles.row}>
          <Text>Boleta:</Text>
          <Text>{boleta.id.slice(0, 8).toUpperCase()}</Text>
        </View>
        <View style={styles.row}>
          <Text>Fecha:</Text>
          <Text>{formatDate(ciclo.fecha_fin)}</Text>
        </View>

        <View style={styles.line} />

        <Text style={styles.bold}>{empleado.nombre}</Text>
        <Text>Código: {empleado.codigo}</Text>
        <Text>
          Periodo: {formatDate(ciclo.fecha_inicio)} -{' '}
          {formatDate(ciclo.fecha_fin)}
        </Text>

        <View style={styles.line} />

        <Text style={styles.bold}>PRODUCCIÓN</Text>
        {producciones.length === 0 && <Text>(Sin registros)</Text>}

        {producciones.map((p: any, i: number) => (
          <View key={i} style={styles.row}>
            <Text>{p.tipo_trabajo?.nombre ?? 'Trabajo'}</Text>
            <Text>{formatMoney(p.subtotal)}</Text>
          </View>
        ))}

        <View style={styles.row}>
          <Text style={styles.bold}>Subtotal:</Text>
          <Text style={styles.bold}>
            {formatMoney(boleta.total_produccion)}
          </Text>
        </View>

        <View style={styles.line} />

        {movimientos.length > 0 && (
          <>
            <Text style={styles.bold}>MOVIMIENTOS</Text>
            {movimientos.map((m: any, i: number) => (
              <View key={i} style={styles.row}>
                <Text>{m.tipo}</Text>
                <Text>
                  {m.signo}
                  {formatMoney(m.monto)}
                </Text>
              </View>
            ))}
            <View style={styles.line} />
          </>
        )}

        <View style={styles.row}>
          <Text style={styles.bold}>TOTAL A PAGAR</Text>
          <Text style={styles.bold}>
            {formatMoney(boleta.total_neto)}
          </Text>
        </View>

        <View style={styles.line} />

        {boleta.pagado && (
          <Text style={styles.center}>
            Pagado el {formatDate(boleta.pagado_at)}
          </Text>
        )}

        <Text style={styles.center}>Gracias por su trabajo</Text>
      </Page>
    </Document>
  );
}

/* =======================
   API ROUTE
======================= */
export async function GET(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const supabase = createServerSupabaseClient();

    const { data: boleta, error } = await supabase
      .from('boletas')
      .select(`
        *,
        empleado:empleados(nombre,codigo),
        ciclo:ciclos(fecha_inicio,fecha_fin)
      `)
      .eq('id', id)
      .single();

    if (error || !boleta) {
      return new Response(
        JSON.stringify({ error: 'Boleta no encontrada' }),
        { status: 404 }
      );
    }

    const { data: producciones } = await supabase
      .from('produccion')
      .select('subtotal, tipo_trabajo(nombre)')
      .eq('empleado_id', boleta.empleado_id)
      .gte('fecha', boleta.ciclo.fecha_inicio)
      .lte('fecha', boleta.ciclo.fecha_fin);

    const { data: movimientos } = await supabase
      .from('movimientos')
      .select('tipo, monto, signo')
      .eq('empleado_id', boleta.empleado_id)
      .gte('fecha', boleta.ciclo.fecha_inicio)
      .lte('fecha', boleta.ciclo.fecha_fin);

    const pdfBuffer = await renderToBuffer(
      <BoletaPDF
        boleta={boleta}
        empleado={boleta.empleado}
        ciclo={boleta.ciclo}
        producciones={producciones ?? []}
        movimientos={movimientos ?? []}
      />
    );

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="boleta-${boleta.empleado.codigo}.pdf"`,
      },
    });

  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: 'Error al generar PDF' }),
      { status: 500 }
    );
  }
}
