import { google } from "googleapis";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { spreadsheetId, kategori, bulan, data } = req.body;

    const columnMap = {
        "Januari": "C",
        "Februari": "D",
        "Maret": "E",
        "April": "F",
        "Mei": "G",
        "Juni": "H",
        "Juli": "I",
        "Agustus": "J",
        "September": "K",
        "Oktober": "L",
        "November": "M",
        "Desember": "N",
    }

    const targetColumn = columnMap[bulan];

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        })

        const sheets = google.sheets({ version: 'v4', auth });

        // 2. Tentukan Range dinamis. Contoh: "Ibu!C9:C200" (Mulai baris 9 agar index array cocok)
        const sheetName = kategori === 'ibu' ? 'Ibu' : 'Anak';
        const range = `${sheetName}!${targetColumn}9:${targetColumn}200`;

        // 3. Susun data inputan dari React (formData)
        const values = [
            [""], [""], // 0, 1 (Header A, Sub 1)
            [data.k1_murni], [data.k1_luar], [data.k1_akses], [data.k1_dokter], [data.k1_usg],
            [data.hamil_tdk_diinginkan], [data.bumil_4t], [data.t_muda], [data.t_tua],
            [data.t_rapat], [data.t_banyak], [data.persen_4t], [data.k4], [data.k5_dokter],
            [data.k5_usg], [data.k6], [data.anc_8x], [data.anc_12t], [data.bumil_periksa], [data.bumil_kia],
            [""], // 22 (Sub 2)
            [data.skrining_td], [data.status_td1], [data.status_td2], [data.status_td3],
            [data.status_td4], [data.status_td5],
            [""], // 29 (Sub Pelayanan TD)
            [data.cakupan_td1], [data.cakupan_td2], [data.cakupan_td3], [data.cakupan_td4],
            [data.cakupan_td5], [data.cakupan_td2_plus], [data.cakupan_td_catin],
            [""], // 37 (Sub 3)
            [data.fe_dapat_ttd], [data.fe_konsumsi_ttd], [data.fe_dapat_mms], [data.fe_konsumsi_mms],
            [""], // 42 (Sub 4)
            [data.te_pelayanan], [data.te_hiv_periksa], [data.te_hiv_reaktif], [data.te_hiv_tata],
            [data.te_sif_periksa], [data.te_sif_tata], [data.te_hep_periksa], [data.te_hep_tata],
            [""], // 51 (Sub 5)
            [data.resiko_nakes], [data.resiko_masyarakat],
            [""], // 54 (Sub 6)
            [data.u_18], [data.u_18_20], [data.u_20_34], [data.u_35],
            [""], // 59 (Sub 7)
            [data.uk_0_12], [data.uk_12_24], [data.uk_24],
            [""], // 63 (Sub 8)
            [data.hk_1], [data.hk_2], [data.hk_3], [data.hk_4], [data.hk_5],
            [""], // 69 (Sub 9)
            [data.jk_kurang_2], [data.jk_lebih_2],
            [""], // 72 (Sub 10)
            [data.hb_11_tm1], [data.anemia_ringan_tm1], [data.anemia_sedang_tm1], [data.anemia_berat_tm1],
            [data.hb_lebih_11], [data.hb_11_tm3], [data.anemia_ringan_tm3], [data.anemia_sedang_tm3],
            [data.anemia_berat_tm3], [data.hb_diperiksa], [data.hb_anemia], [data.hb_anemia_ttd], [data.hb_anemia_tata],
            [""], // 86 (Sub 11)
            [data.gizi_lila], [data.gizi_resiko_kek], [data.gizi_kek], [data.gizi_kek_pmt], [data.gizi_kek_konsumsi],
            [""], // 92 (Sub 12)
            [data.kls_kia], [data.kls_ibu_4x], [data.kls_keluarga],
            [""], // 96 (Sub 13)
            [data.komp_abortus], [data.komp_perdarahan], [data.komp_mola], [data.komp_ket],
            [data.komp_placenta], [data.komp_solusio], [data.komp_retensio], [data.komp_rest],
            [data.komp_atonia], [data.komp_ruptura], [data.komp_immatur], [data.komp_prematur],
            [data.komp_gameli], [data.komp_preeklampsia], [data.komp_eklampsi], [data.komp_hiper],
            [data.komp_kpd], [data.komp_lama], [data.komp_sero], [data.komp_kjdr], [data.komp_lintang],
            [data.komp_sungsang], [data.komp_distosia], [data.komp_makro], [data.komp_infeksi],
            [data.komp_tb], [data.komp_malaria], [data.komp_jantung], [data.komp_dm],
            [data.komp_obesitas], [data.komp_lain],
            [""], // 128 (Sub 14)
            [data.skrin_preeklam], [data.skrin_preeklam_tata], [data.skrin_hdk], [data.skrin_hdk_tata],
            [data.skrin_keswa1], [data.skrin_keswa3], [data.skrin_kie], [data.skrin_pendarahan],
            [""], [""], // 137, 138 (Header B, Sub 15)
            [data.salin_12t],
            [""], // 140 (Sub Penolong)
            [data.salin_nakes], [data.salin_non_nakes],
            [""], // 143 (Sub Cara)
            [data.salin_normal], [data.salin_sc], [data.sc_indikasi], [data.sc_minta],
            [""], // 148 (Sub Tempat)
            [data.tempat_faskes], [data.tempat_non_faskes],
            [""], // 151 (Sub Biaya)
            [data.biaya_jkn], [data.biaya_umum], [data.biaya_imd], [data.biaya_asi],
            [data.nifas_vit_a], [data.nifas_ttd], // 156, 157 (Vit A dan TTD)
            [""], // 158 (Sub 18)
            [data.pu_18], [data.pu_18_20], [data.pu_20_34], [data.pu_35],
            [""], // 163 (Sub 19)
            [data.pk_1], [data.pk_2], [data.pk_3], [data.pk_4], [data.pk_5],
            [""], // 169 (Sub 20)
            [data.jp_kurang_2],
            [""], // 171 (Sub 21)
            [data.kf_1], [data.kf_2], [data.kf_3], [data.kf_4],
            [""], // 176 (Sub 22)
            [data.rep_desa], [data.rep_pusk], [data.rep_rtk], [data.rep_fas] // 180
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId: spreadsheetId,
            range: range,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values },
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
