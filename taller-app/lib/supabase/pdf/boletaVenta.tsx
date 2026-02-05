import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    renderToBuffer,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        width: 280,
        padding: 16,
        fontSize: 9,
        fontFamily: 'Helvetica',
    },
    center: { textAlign: 'center' },
    bold: { fontWeight: 'bold' },
    line: {
        borderBottom: '1 solid #000',
        marginVertical: 6,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottom: '1 solid #000',
        paddingBottom: 4,
        marginTop: 6,
    },
    colDesc: { width: '40%' },
    colQty: { width: '15%', textAlign: 'right' },
    colPU: { width: '20%', textAlign: 'right' },
    colTotal: { width: '25%', textAlign: 'right' },
});

function BoletaVentaPDF({ boleta, detalles }: any) {
    const money = (n: number) => `S/. ${Number(n).toFixed(2)}`;
    const date = (d: string) =>
        new Date(d).toLocaleDateString('es-PE');

    return (
        <Document>
            <Page size="A6" style={styles.page}>

                {/* EMPRESA */}
                <Text style={[styles.center, styles.bold]}>GLASARD PERÚ</Text>
                <Text style={styles.center}>BOLETA DE VENTA</Text>

                <View style={styles.line} />

                {/* DATOS */}
                <View style={styles.row}>
                    <Text>Fecha:</Text>
                    <Text>{date(boleta.created_at)}</Text>
                </View>

                <Text>Cliente: {boleta.cliente_nombre}</Text>
                <Text>DNI/RUC: {boleta.cliente_documento || '-'}</Text>
                <Text>Dirección: {boleta.cliente_direccion || '-'}</Text>

                <View style={styles.line} />

                {/* CABECERA TABLA */}
                <View style={styles.tableHeader}>
                    <Text style={styles.colDesc}>Desc</Text>
                    <Text style={styles.colQty}>Cant</Text>
                    <Text style={styles.colPU}>P.U</Text>
                    <Text style={styles.colTotal}>Total</Text>
                </View>

                {/* DETALLE */}
                {detalles.map((d: any, i: number) => (
                    <View key={i} style={styles.row}>
                        <Text style={styles.colDesc}>{d.descripcion}</Text>
                        <Text style={styles.colQty}>{d.cantidad}</Text>
                        <Text style={styles.colPU}>{money(d.precio_unitario)}</Text>
                        <Text style={styles.colTotal}>{money(d.total)}</Text>
                    </View>
                ))}

                <View style={styles.line} />

                {/* TOTALES */}
                <View style={styles.row}>
                    <Text>Subtotal:</Text>
                    <Text>{money(boleta.subtotal)}</Text>
                </View>

                <View style={styles.row}>
                    <Text>IGV (18%):</Text>
                    <Text>{money(boleta.igv)}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.bold}>TOTAL:</Text>
                    <Text style={styles.bold}>{money(boleta.total)}</Text>
                </View>

                <View style={styles.line} />

                <Text style={styles.center}>Gracias por su compra</Text>

            </Page>
        </Document>
    );
}

export async function generateBoletaVentaPDF({
    boleta,
    detalles,
}: {
    boleta: any;
    detalles: any[];
}) {
    const buffer = await renderToBuffer(
        <BoletaVentaPDF boleta={boleta} detalles={detalles} />
    );

    return buffer;
}
