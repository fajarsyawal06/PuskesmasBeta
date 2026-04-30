// api/update-sheet.js
import { google } from 'googleapis';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { spreadsheetId, kategori, bulan, data } = req.body;

    let targetColumn, rangeUpdate;
    const sheetName = kategori === 'ibu' ? 'Ibu' : 'Anak';

    if (kategori === 'anak') {
        const columnMapAnak = {
            "Januari": "C:D", "Februari": "F:G", "Maret": "I:J", "April": "L:M",
            "Mei": "O:P", "Juni": "R:S", "Juli": "U:V", "Agustus": "X:Y",
            "September": "AA:AB", "Oktober": "AD:AE", "November": "AG:AH", "Desember": "AJ:AK"
        };
        const cols = columnMapAnak[bulan].split(':');
        // Karena Kategori Anak mulai dari baris 8
        const endRowAnak = 7 + data.length;
        rangeUpdate = `${sheetName}!${cols[0]}8:${cols[1]}${endRowAnak}`;
    } else {
        const columnMapIbu = {
            "Januari": "C", "Februari": "D", "Maret": "E", "April": "F",
            "Mei": "G", "Juni": "H", "Juli": "I", "Agustus": "J",
            "September": "K", "Oktober": "L", "November": "M", "Desember": "N"
        };
        targetColumn = columnMapIbu[bulan];
        // Kategori Ibu mulai dari baris 9
        const endRowIbu = 8 + data.length;
        rangeUpdate = `${sheetName}!${targetColumn}9:${targetColumn}${endRowIbu}`;
    }

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
        await sheets.spreadsheets.values.update({
            spreadsheetId: spreadsheetId,
            range: rangeUpdate,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: data }, // Langsung memasukkan array data dinamis dari React
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}