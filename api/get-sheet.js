import { google } from 'googleapis';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Hanya menerima metode GET' });
    }

    const { spreadsheetId, kategori, bulan } = req.query;

    let targetIndex, pIndex, totalIndex;

    if (kategori === 'anak') {
        const anakIndexMap = {
            "Januari": 2, "Februari": 5, "Maret": 8, "April": 11,
            "Mei": 14, "Juni": 17, "Juli": 20, "Agustus": 23,
            "September": 26, "Oktober": 29, "November": 32, "Desember": 35
        };
        targetIndex = anakIndexMap[bulan];
        pIndex = targetIndex + 1;
        totalIndex = targetIndex + 2;
    } else {
        const ibuIndexMap = {
            "Januari": 2, "Februari": 3, "Maret": 4, "April": 5,
            "Mei": 6, "Juni": 7, "Juli": 8, "Agustus": 9,
            "September": 10, "Oktober": 11, "November": 12, "Desember": 13
        };
        targetIndex = ibuIndexMap[bulan];
    }

    try {
        let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
            privateKey = privateKey.slice(1, -1);
        }
        privateKey = privateKey.replace(/\\n/g, '\n');

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: privateKey,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const sheetName = kategori === 'ibu' ? 'Ibu' : 'Anak';

        // Jika kategori anak, data dimulai dari baris 8 ("Dasar") dan sampai baris 89
        // Jika ibu, data dimulai dari baris 9
        const range = kategori === 'anak' ? `${sheetName}!A8:AL89` : `${sheetName}!A9:N189`;

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: range,
        });

        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        const rawValues = response.data.values || [];

        // Filter agar React menerima format yang sesuai kategori
        const formattedValues = rawValues.map(row => {
            if (kategori === 'anak') {
                return [
                    row[0] || "",         // Nomor (Kolom A)
                    row[1] || "",         // Uraian Kegiatan (Kolom B)
                    row[targetIndex] || "", // Laki-laki
                    row[pIndex] || "",      // Perempuan
                    row[totalIndex] || ""   // Total
                ];
            } else {
                return [
                    row[0] || "",         // Nomor (Kolom A)
                    row[1] || "",         // Uraian Kegiatan (Kolom B)
                    row[targetIndex] || "" // Data angka
                ];
            }
        });

        return res.status(200).json({ success: true, values: formattedValues });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}