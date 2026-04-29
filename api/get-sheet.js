// api/get-sheet.js
import { google } from 'googleapis';

export default async function handler(req, res) {
    // Hanya izinkan metode GET
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Hanya menerima metode GET' });
    }

    // Ambil parameter dari URL (query string)
    const { spreadsheetId, kategori, bulan } = req.query;

    const columnMap = {
        "Januari": "C", "Februari": "D", "Maret": "E", "April": "F",
        "Mei": "G", "Juni": "H", "Juli": "I", "Agustus": "J",
        "September": "K", "Oktober": "L", "November": "M", "Desember": "N"
    };

    const targetColumn = columnMap[bulan];

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const sheetName = kategori === 'ibu' ? 'Ibu' : 'Anak';

        // Ubah range mulai dari baris 9 agar index array sejajar dengan template (index 0 = baris 9)
        const range = `${sheetName}!${targetColumn}9:${targetColumn}200`;

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: range,
        });

        // Mencegah Vercel melakukan caching terhadap response ini
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        // Google mengembalikan data dalam bentuk Array 2D: [[val1], [val2], ...]
        return res.status(200).json({
            success: true,
            values: response.data.values || []
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}