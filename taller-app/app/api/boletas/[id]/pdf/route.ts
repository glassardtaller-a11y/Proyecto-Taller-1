import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { jsPDF } from 'jspdf';

// Thermal ticket dimensions (58mm width ≈ 164 points at 72dpi)
const TICKET_WIDTH = 164;
const MARGIN = 8;
const LINE_HEIGHT = 10;
const SMALL_LINE = 8;

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: boletaId } = await params;
        const supabase = createServerSupabaseClient();

        // Fetch boleta with relations
        const { data: boleta, error: boletaError } = await supabase
            .from('boletas')
            .select(`
                id,
                empleado_id,
                ciclo_id,
                total_produccion,
                total_adelantos,
                total_descuentos,
                total_neto,
                pagado,
                pagado_at,
                created_at,
                empleado:empleados(id, nombre, codigo),
                ciclo:ciclos(id, fecha_inicio, fecha_fin, total_pagado)
            `)
            .eq('id', boletaId)
            .single();

        if (boletaError || !boleta) {
            return NextResponse.json(
                { error: 'Boleta no encontrada' },
                { status: 404 }
            );
        }

        // Flatten joins
        const empleado = Array.isArray(boleta.empleado) ? boleta.empleado[0] : boleta.empleado;
        const ciclo = Array.isArray(boleta.ciclo) ? boleta.ciclo[0] : boleta.ciclo;

        if (!empleado || !ciclo) {
            return NextResponse.json(
                { error: 'Datos incompletos' },
                { status: 400 }
            );
        }

        // Fetch production details for period
        const { data: producciones } = await supabase
            .from('produccion')
            .select(`
                cantidad,
                tarifa_aplicada,
                subtotal,
                tipo_trabajo:tipos_trabajo(nombre)
            `)
            .eq('empleado_id', boleta.empleado_id)
            .gte('fecha', ciclo.fecha_inicio)
            .lte('fecha', ciclo.fecha_fin);

        // Fetch movements for period
        const { data: movimientos } = await supabase
            .from('movimientos')
            .select('tipo, monto, signo, nota')
            .eq('empleado_id', boleta.empleado_id)
            .gte('fecha', ciclo.fecha_inicio)
            .lte('fecha', ciclo.fecha_fin);

        // Generate PDF
        const pdf = generateTicketPDF({
            boleta,
            empleado,
            ciclo,
            producciones: producciones ?? [],
            movimientos: movimientos ?? [],
        });

        // Return PDF as response
        const pdfBuffer = pdf.output('arraybuffer');

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="boleta-${empleado.codigo}-${ciclo.fecha_fin}.pdf"`,
            },
        });

    } catch (error: any) {
        console.error('Error generating PDF:', error);
        return NextResponse.json(
            { error: error?.message ?? 'Error al generar PDF' },
            { status: 500 }
        );
    }
}

function generateTicketPDF(data: {
    boleta: any;
    empleado: { id: string; nombre: string; codigo: string };
    ciclo: { id: string; fecha_inicio: string; fecha_fin: string; total_pagado: number };
    producciones: any[];
    movimientos: any[];
}): jsPDF {
    const { boleta, empleado, ciclo, producciones, movimientos } = data;

    // Calculate approximate height
    const headerLines = 8;
    const prodLines = producciones.length + 2;
    const movLines = movimientos.length + 2;
    const footerLines = 8;
    const totalLines = headerLines + prodLines + movLines + footerLines;
    const estimatedHeight = totalLines * LINE_HEIGHT + 40;

    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: [TICKET_WIDTH, Math.max(200, estimatedHeight)],
    });

    let y = MARGIN;

    // Helper functions
    const centerText = (text: string, fontSize: number = 8) => {
        pdf.setFontSize(fontSize);
        const textWidth = pdf.getTextWidth(text);
        const x = (TICKET_WIDTH - textWidth) / 2;
        pdf.text(text, x, y);
        y += fontSize === 10 ? LINE_HEIGHT : SMALL_LINE;
    };

    const leftText = (text: string, fontSize: number = 7) => {
        pdf.setFontSize(fontSize);
        pdf.text(text, MARGIN, y);
        y += SMALL_LINE;
    };

    const rightText = (text: string, fontSize: number = 7) => {
        pdf.setFontSize(fontSize);
        const textWidth = pdf.getTextWidth(text);
        pdf.text(text, TICKET_WIDTH - MARGIN - textWidth, y);
    };

    const lineText = (left: string, right: string, fontSize: number = 7) => {
        pdf.setFontSize(fontSize);
        pdf.text(left, MARGIN, y);
        const textWidth = pdf.getTextWidth(right);
        pdf.text(right, TICKET_WIDTH - MARGIN - textWidth, y);
        y += SMALL_LINE;
    };

    const dottedLine = () => {
        pdf.setFontSize(6);
        const dots = '-'.repeat(38);
        const textWidth = pdf.getTextWidth(dots);
        const x = (TICKET_WIDTH - textWidth) / 2;
        pdf.text(dots, x, y);
        y += 6;
    };

    const formatMoney = (amount: number) => `S/. ${amount.toFixed(2)}`;

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // ========= HEADER =========
    pdf.setFont('helvetica', 'bold');
    centerText('TALLER', 12);
    pdf.setFont('helvetica', 'normal');
    centerText('BOLETA DE PAGO', 10);
    dottedLine();

    // Date and number
    lineText(`Boleta: ${boleta.id.substring(0, 8).toUpperCase()}`, formatDate(ciclo.fecha_fin));
    y += 4;

    // ========= EMPLOYEE INFO =========
    pdf.setFont('helvetica', 'bold');
    leftText(`${empleado.nombre}`, 9);
    pdf.setFont('helvetica', 'normal');
    leftText(`Código: ${empleado.codigo}`);
    lineText(`Período:`, `${formatDate(ciclo.fecha_inicio)} - ${formatDate(ciclo.fecha_fin)}`);
    dottedLine();

    // ========= PRODUCTION DETAIL =========
    pdf.setFont('helvetica', 'bold');
    leftText('PRODUCCIÓN:', 8);
    pdf.setFont('helvetica', 'normal');

    if (producciones.length === 0) {
        leftText('  (sin registros)');
    } else {
        // Group by tipo_trabajo
        const grouped: Record<string, { cantidad: number; subtotal: number; tarifa: number }> = {};

        producciones.forEach((p: any) => {
            const nombre = p.tipo_trabajo?.nombre || 'Otro';
            if (!grouped[nombre]) {
                grouped[nombre] = { cantidad: 0, subtotal: 0, tarifa: p.tarifa_aplicada };
            }
            grouped[nombre].cantidad += p.cantidad;
            grouped[nombre].subtotal += p.subtotal;
        });

        Object.entries(grouped).forEach(([nombre, data]) => {
            // Truncate name if too long
            const displayName = nombre.length > 18 ? nombre.substring(0, 16) + '..' : nombre;
            lineText(`  ${displayName}`, formatMoney(data.subtotal));
            leftText(`    ${data.cantidad} x ${formatMoney(data.tarifa)}`);
        });
    }

    y += 2;
    pdf.setFont('helvetica', 'bold');
    lineText('  Subtotal Producción:', formatMoney(boleta.total_produccion), 8);
    pdf.setFont('helvetica', 'normal');
    dottedLine();

    // ========= MOVEMENTS =========
    if (movimientos.length > 0) {
        pdf.setFont('helvetica', 'bold');
        leftText('MOVIMIENTOS:', 8);
        pdf.setFont('helvetica', 'normal');

        movimientos.forEach((m: any) => {
            const tipo = m.tipo.charAt(0).toUpperCase() + m.tipo.slice(1);
            const signo = m.signo === '+' ? '+' : '-';
            lineText(`  ${tipo}`, `${signo}${formatMoney(m.monto)}`);
        });

        y += 2;
        dottedLine();
    }

    // ========= TOTALS =========
    pdf.setFont('helvetica', 'bold');
    lineText('RESUMEN:', '', 8);
    pdf.setFont('helvetica', 'normal');

    lineText('  Producción:', formatMoney(boleta.total_produccion));

    if (boleta.total_adelantos > 0) {
        lineText('  Adelantos:', `-${formatMoney(boleta.total_adelantos)}`);
    }

    if (boleta.total_descuentos > 0) {
        lineText('  Descuentos:', `-${formatMoney(boleta.total_descuentos)}`);
    }

    y += 4;
    dottedLine();

    // Total neto
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    const totalText = 'TOTAL A PAGAR:';
    const totalAmount = formatMoney(boleta.total_neto);
    pdf.text(totalText, MARGIN, y);
    const amountWidth = pdf.getTextWidth(totalAmount);
    pdf.text(totalAmount, TICKET_WIDTH - MARGIN - amountWidth, y);
    y += LINE_HEIGHT + 4;

    dottedLine();

    // ========= FOOTER =========
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6);

    if (boleta.pagado) {
        const pagadoText = `Pagado: ${boleta.pagado_at ? formatDate(boleta.pagado_at) : 'Sí'}`;
        centerText(pagadoText, 7);
    }

    y += 4;
    centerText('Gracias por su trabajo', 7);
    centerText('---', 6);

    return pdf;
}
