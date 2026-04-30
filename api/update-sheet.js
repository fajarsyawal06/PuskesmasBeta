// api/update-sheet.js
import { google } from 'googleapis';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { spreadsheetId, kategori, bulan, desa, data, rekapIbuId, rekapAnakId } = req.body;

    let targetColumn, rangeUpdate;
    let endRow;
    const sheetName = kategori === 'ibu' ? 'Ibu' : 'Anak';

    if (kategori === 'anak') {
        const columnMapAnak = {
            "Januari": "C:E", "Februari": "F:H", "Maret": "I:K", "April": "L:N",
            "Mei": "O:Q", "Juni": "R:T", "Juli": "U:W", "Agustus": "X:Z",
            "September": "AA:AC", "Oktober": "AD:AF", "November": "AG:AI", "Desember": "AJ:AL"
        };
        const cols = columnMapAnak[bulan].split(':');
        // Karena Kategori Anak mulai dari baris 8
        endRow = 7 + data.length;
        rangeUpdate = `${sheetName}!${cols[0]}8:${cols[1]}${endRow}`;
    } else {
        const columnMapIbu = {
            "Januari": "C", "Februari": "D", "Maret": "E", "April": "F",
            "Mei": "G", "Juni": "H", "Juli": "I", "Agustus": "J",
            "September": "K", "Oktober": "L", "November": "M", "Desember": "N"
        };
        targetColumn = columnMapIbu[bulan];
        // Kategori Ibu mulai dari baris 9
        endRow = 8 + data.length;
        rangeUpdate = `${sheetName}!${targetColumn}9:${targetColumn}${endRow}`;
    }

    // Mapping Desa ke Kolom Rekapitulasi
    const rekapKolomIbu = {
        "desa-dongi": "C",
        "desa-otting": "D",
        "desa-bulucenrana": "E",
        "desa-betao": "F",
        "desa-betao-riase": "G",
        "desa-kalempang": "H"
    };

    const rekapKolomAnak = {
        "desa-dongi": "C:E",
        "desa-otting": "F:H",
        "desa-bulucenrana": "I:K",
        "desa-betao": "L:N",
        "desa-betao-riase": "O:Q",
        "desa-kalempang": "R:T"
    };

    try {
        let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) privateKey = privateKey.slice(1, -1);
        privateKey = privateKey.replace(/\\n/g, '\n');

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: privateKey,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // --- 1. UPDATE SPREADSHEET DESA UTAMA ---
        await sheets.spreadsheets.values.update({
            spreadsheetId: spreadsheetId,
            range: rangeUpdate,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: data }, // Langsung memasukkan array data dinamis dari React
        });

        // --- 2. UPDATE SPREADSHEET REKAPITULASI (Auto-Sync) ---
        const rekapId = kategori === 'ibu' ? rekapIbuId : rekapAnakId;

        if (rekapId && desa) {
            let rekapRange;
            const tabRekap = bulan; // Tab di rekapitulasi adalah nama bulan (contoh: "Januari")

            if (kategori === 'ibu') {
                const col = rekapKolomIbu[desa.toLowerCase()];
                if (col) {
                    rekapRange = `${tabRekap}!${col}9:${col}${endRow}`;
                }
            } else {
                const cols = rekapKolomAnak[desa.toLowerCase()];
                if (cols) {
                    const colArray = cols.split(':');
                    rekapRange = `${tabRekap}!${colArray[0]}8:${colArray[1]}${endRow}`;
                }
            }

            if (rekapRange) {
                try {
                    await sheets.spreadsheets.values.update({
                        spreadsheetId: rekapId,
                        range: rekapRange,
                        valueInputOption: 'USER_ENTERED',
                        requestBody: { values: data },
                    });
                    console.log(`Berhasil auto-sync rekapitulasi untuk desa: ${desa}`);
                } catch (rekapError) {
                    console.error(`Gagal auto-sync rekapitulasi desa ${desa}:`, rekapError);
                    // Kita kirim peringatan ini ke frontend agar user tahu
                    return res.status(200).json({ 
                        success: true, 
                        warning: `Data desa tersimpan, namun gagal menyinkronkan ke Rekapitulasi. Pesan sistem: ${rekapError.message}` 
                    });
                }
            }
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}