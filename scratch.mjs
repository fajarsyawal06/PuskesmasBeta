import { google } from 'googleapis';
import fs from 'fs';

async function checkRows() {
    try {
        const envStr = fs.readFileSync('d:/BelajarReact/Puskesmas/.env', 'utf8');
        const envVars = {};
        envStr.split('\n').forEach(line => {
            const [key, ...valParts] = line.split('=');
            if (key && valParts.length) {
                envVars[key.trim()] = valParts.join('=').trim();
            }
        });

        let privateKey = envVars.GOOGLE_PRIVATE_KEY || '';
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) privateKey = privateKey.slice(1, -1);
        privateKey = privateKey.replace(/\\n/g, '\n');

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: envVars.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: privateKey,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: '1U3i38cQnB4K7b89gS82P8VjN0hRMBGg751WIfgq2uEw', // This was previously in env, wait, I can just hardcode the Admin ID
            range: 'Januari!A1:B189',
        });

        const rows = res.data.values;
        let found = false;
        rows.forEach((row, index) => {
            if (row[1] && row[1].toLowerCase().includes('jumlah puskesmas')) {
                console.log(`\nBaris ${index + 1}: ${row[0] || ''} | ${row[1]}`);
                // Print 5 rows after it to see the structure
                for(let i=1; i<=5; i++) {
                    if(rows[index+i]) console.log(`Baris ${index + 1 + i}: ${rows[index+i][0] || ''} | ${rows[index+i][1]}`);
                }
                found = true;
            }
        });
        if(!found) console.log("Not found.");
    } catch (e) {
        console.error(e);
    }
}

checkRows();
