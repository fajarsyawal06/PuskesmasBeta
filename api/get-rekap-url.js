import { google } from 'googleapis';

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

    const { kategori, bulan, spreadsheetId } = req.query;

    if (!kategori || !bulan) {
        return res.status(400).json({ error: 'Kategori dan bulan diperlukan.' });
    }

    if (!spreadsheetId) {
        return res.status(401).json({ error: 'Spreadsheet ID belum dikonfigurasi pada menu Admin Firebase.' });
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
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        
        // Dapatkan metadata spreadsheet untuk mencari sheetId (gid) dari nama tab
        const response = await sheets.spreadsheets.get({
            spreadsheetId: spreadsheetId,
        });

        const allSheets = response.data.sheets || [];
        
        // Cari tab yang namanya sama dengan bulan yang dipilih (case-insensitive)
        const targetSheet = allSheets.find(s => s.properties.title.toLowerCase() === bulan.toLowerCase());

        let url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
        
        // Jika tab dengan nama bulan ditemukan, tambahkan #gid= agar langsung membuka tab tersebut
        if (targetSheet) {
            url += `#gid=${targetSheet.properties.sheetId}`;
        }

        return res.status(200).json({ success: true, url });
    } catch (error) {
        return res.status(500).json({ error: 'Gagal mengambil data dari Google Sheets: ' + error.message });
    }
}
