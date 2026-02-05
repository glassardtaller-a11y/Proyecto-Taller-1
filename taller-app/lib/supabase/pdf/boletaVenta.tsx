import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
    renderToBuffer,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 32,
        fontSize: 10,
        fontFamily: 'Helvetica',
    },

    bold: { fontWeight: 'bold' },
    center: { textAlign: 'center' },
    small: { fontSize: 9 },

    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },

    box: {
        border: '1 solid #000',
        padding: 6,
    },

    rightBox: {
        border: '1 solid #000',
        padding: 10,
        alignItems: 'center',
    },

    line: {
        borderBottom: '1 solid #000',
        marginVertical: 10,
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    tableHeader: {
        flexDirection: 'row',
        borderBottom: '1 solid #000',
        paddingBottom: 4,
        marginTop: 10,
        fontWeight: 'bold',
    },

    colQty: { width: '10%', textAlign: 'center' },
    colDesc: { width: '40%' },
    colVU: { width: '15%', textAlign: 'right' },
    colPU: { width: '15%', textAlign: 'right' },
    colTotal: { width: '20%', textAlign: 'right' },
});

/* ================================================= */

function BoletaVentaPDF({ boleta, detalles }: any) {

    const money = (n: number) => `S/. ${Number(n).toFixed(2)}`;

    function numeroALetras(num: number) {

        const unidades = [
            '', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO',
            'SEIS', 'SIETE', 'OCHO', 'NUEVE'
        ];

        const decenas = [
            '', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA',
            'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'
        ];

        const especiales: any = {
            11: 'ONCE', 12: 'DOCE', 13: 'TRECE', 14: 'CATORCE', 15: 'QUINCE'
        };

        function convertirMenor100(n: number) {
            if (n <= 9) return unidades[n];
            if (especiales[n]) return especiales[n];

            const d = Math.floor(n / 10);
            const u = n % 10;

            if (n >= 16 && n <= 19) return 'DIECI' + unidades[u];
            if (n >= 21 && n <= 29) return 'VEINTI' + unidades[u];

            return decenas[d] + (u ? ' Y ' + unidades[u] : '');
        }

        function convertir(n: number): string {
            if (n < 100) return convertirMenor100(n);
            if (n < 1000) {
                const c = Math.floor(n / 100);
                const r = n % 100;
                return (c === 1 ? 'CIENTO' : unidades[c] + 'CIENTOS') +
                    (r ? ' ' + convertirMenor100(r) : '');
            }
            if (n < 1000000) {
                const m = Math.floor(n / 1000);
                const r = n % 1000;
                return (m === 1 ? 'MIL' : convertir(m) + ' MIL') +
                    (r ? ' ' + convertir(r) : '');
            }
            return '';
        }

        const entero = Math.floor(num);
        const decimal = Math.round((num - entero) * 100);

        return `${convertir(entero)} CON ${decimal.toString().padStart(2, '0')}/100 SOLES`;
    }

    const date = (d: string) =>
        new Date(d).toLocaleDateString('es-PE');

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* ================= EMPRESA ================= */}
                <View style={styles.headerRow}>

                    <Image
                        src="file:///public/logo.png"
                        style={{ width: 90, marginBottom: 6 }}
                    />

                    <View style={{ width: '60%' }}>
                        <Text style={styles.bold}>GLASARD PERÚ</Text>
                        <Text style={styles.small}>RUC: 20600000001</Text>
                        <Text style={styles.small}>Dirección: Av. Principal 123 - Cajamarca</Text>
                        <Text style={styles.small}>Tel: 976672837</Text>
                        <Text style={styles.small}>Email: glasardtaller@gmail.com</Text>
                    </View>

                    <View style={[styles.rightBox, { width: '35%' }]}>
                        <Text style={styles.bold}>BOLETA DE VENTA</Text>
                        <Text>
                            {boleta.serie}-{String(boleta.numero).padStart(8, '0')}
                        </Text>
                    </View>

                </View>

                {/* ================= DATOS CLIENTE ================= */}
                <View style={[styles.box, { marginBottom: 10 }]}>

                    <View style={styles.row}>
                        <Text>Cliente: {boleta.cliente_nombre}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text>DNI / RUC: {boleta.cliente_documento || '-'}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text>Dirección: {boleta.cliente_direccion || '-'}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text>Fecha Emisión: {date(boleta.created_at)}</Text>
                    </View>

                </View>

                {/* ================= CABECERA TABLA ================= */}
                <View style={styles.tableHeader}>
                    <Text style={styles.colQty}>Cant</Text>
                    <Text style={styles.colDesc}>Descripción</Text>
                    <Text style={styles.colVU}>V/U</Text>
                    <Text style={styles.colPU}>P/U</Text>
                    <Text style={styles.colTotal}>Importe</Text>
                </View>

                {/* ================= DETALLE ================= */}
                {detalles.map((d: any, i: number) => (
                    <View key={i} style={styles.row}>
                        <Text style={styles.colQty}>{d.cantidad}</Text>
                        <Text style={styles.colDesc}>{d.descripcion}</Text>
                        <Text style={styles.colVU}>
                            {money(d.precio_unitario / 1.18)}
                        </Text>
                        <Text style={styles.colPU}>
                            {money(d.precio_unitario)}
                        </Text>
                        <Text style={styles.colTotal}>
                            {money(d.total)}
                        </Text>
                    </View>
                ))}

                <View style={styles.line} />

                {/* ================= TOTALES ================= */}
                <View style={{ width: '40%', alignSelf: 'flex-end' }}>

                    <View style={styles.row}>
                        <Text>GRAVADA:</Text>
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

                </View>

                <View style={styles.line} />

                <View style={styles.box}>
                    <Text>
                        IMPORTE EN LETRAS: {numeroALetras(boleta.total)}
                    </Text>
                </View>


                <Text style={styles.center}>
                    Gracias por su compra
                </Text>

            </Page>
        </Document>
    );
}

/* ================================================= */

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
