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

export async function generateBoletaPDF({
    boleta,
    empleado,
    ciclo,
    producciones,
    movimientos,
}: {
    boleta: any;
    empleado: any;
    ciclo: any;
    producciones: any[];
    movimientos: any[];
}) {
    const buffer = await renderToBuffer(
        <BoletaPDF
            boleta={boleta}
            empleado={empleado}
            ciclo={ciclo}
            producciones={producciones}
            movimientos={movimientos}
        />
    );

    return buffer;
}

