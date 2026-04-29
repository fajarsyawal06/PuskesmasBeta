import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function InputData() {
    // 1. Mengambil parameter dari URL yang dikirim oleh Modal
    const { desa, bulan, spreadsheetId, kategori } = useParams();
    const navigate = useNavigate();

    // State untuk *loading* dan menyimpan data ketikan user
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({});

    // Merapikan nama desa untuk ditampilkan di Kop Surat (Misal: "Desa-dongi" -> "DONGI")
    const namaDesaFormat = desa ? desa.replace('Desa-', '').replace('-', ' ').toUpperCase() : '';
    // Memotong nama bulan untuk header tabel (Misal: "Januari" -> "JAN")
    const singkatanBulan = bulan ? bulan.substring(0, 3).toUpperCase() : '';

    // 2. Fungsi untuk menangkap perubahan angka pada input box
    const handleChange = (e, id) => {
        setFormData({
            ...formData,
            [id]: e.target.value
        });
    };

    // 3. Fungsi untuk mengirim data ke Vercel Serverless Function
    const handleSimpan = async () => {
        setIsLoading(true);

        try {
            const response = await fetch('/api/update-sheet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    spreadsheetId: spreadsheetId, // ID unik dari file spreadsheet desa ini
                    kategori: kategori,           // "ibu" atau "anak"
                    bulan: bulan,                 // "Januari", "Februari", dll
                    data: formData                // Objek berisi angka-angka inputan
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert(`Data Laporan ${kategori.toUpperCase()} bulan ${bulan} berhasil disimpan ke Spreadsheet!`);
            } else {
                throw new Error(result.error || "Gagal menyimpan data ke Google Sheets");
            }
        } catch (error) {
            console.error("Terjadi kesalahan:", error);
            alert("Gagal menyimpan: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // 4. TEMPLATE DATA (Berdasarkan gambar Excel yang kamu berikan)
    // ID di sini WAJIB sama dengan variabel data.id yang ditangkap di update-sheet.js
    const templateIbu = [

        { id: 'h_a', type: 'header', no: 'A.', label: 'SITUASI KEHAMILAN', bg: 'bg-gray-200' }, // 0
        { id: 'h_1', type: 'subheader', no: '1', label: 'Kunjungan Ibu Hamil', bg: 'bg-gray-100' }, // 1
        { id: 'k1_murni', type: 'input', no: '', label: 'Jumlah K1 Murni (Kunjungan pertama Umur kehamilan 0 - 12 Minggu)', bg: '' }, // 2
        { id: 'k1_luar', type: 'input', no: '', label: 'JumlahK1 di luar K1 Murni (Kunjungan pertama Umur kehamilan > 12 Minggu)', bg: '' }, // 3
        { id: 'k1_akses', type: 'input', no: '', label: 'Jumlah K1 Akses (Jumlah seluruh kunjungan K1)', bg: '' }, // 4
        { id: 'k1_dokter', type: 'input', no: '', label: 'K1 Oleh dokter', bg: '' }, // 5
        { id: 'k1_usg', type: 'input', no: '', label: 'K1 USG Oleh dokter', bg: '' }, // 6
        { id: 'hamil_tdk_diinginkan', type: 'input', no: '', label: 'Kehamilan yang tidak di inginkan', bg: '' }, // 7
        { id: 'bumil_4t', type: 'input', no: '', label: 'Ibu hamil dengan 4T', bg: 'bg-orange-100' }, // 8
        { id: 't_muda', type: 'input', no: '', label: '- Terlalu Muda', bg: 'bg-orange-50' }, // 9
        { id: 't_tua', type: 'input', no: '', label: '- Terlalu Tua', bg: 'bg-orange-50' }, // 10
        { id: 't_rapat', type: 'input', no: '', label: '- Terlalu rapat', bg: 'bg-orange-50' }, // 11
        { id: 't_banyak', type: 'input', no: '', label: '- Terlalu Banyak', bg: 'bg-orange-50' }, // 12
        { id: 'persen_4t', type: 'input', no: '', label: 'Persentase Bumil 4 T', bg: '' }, // 13
        { id: 'k4', type: 'input', no: '', label: 'Jumlah K4 (sesuai interval kunjungan minimal per Tri Mester(1,1,2)', bg: '' }, // 14
        { id: 'k5_dokter', type: 'input', no: '', label: 'K5 Oleh dokter', bg: '' }, // 15
        { id: 'k5_usg', type: 'input', no: '', label: 'K5 USG Oleh dokter', bg: '' }, // 16
        { id: 'k6', type: 'input', no: '', label: 'Jumlah K6 (sesuai interval kunjungan minimal per Tri Mester(1,2,3)', bg: '' }, // 17
        { id: 'anc_8x', type: 'input', no: '', label: 'Cakupan ibu hamil ANC 8 X', bg: '' }, // 18
        { id: 'anc_12t', type: 'input', no: '', label: 'Cakupan ANC Sesuai Standar 12 T', bg: '' }, // 19
        { id: 'bumil_periksa', type: 'input', no: '', label: 'Ibu hamil yang periksa', bg: '' }, // 20
        { id: 'bumil_kia', type: 'input', no: '', label: 'Ibu hamil yang memiliki buku KIA', bg: '' }, // 21
        { id: 'h_2', type: 'subheader', no: '2', label: 'Imunisasi TD', bg: 'bg-gray-100' }, // 22
        { id: 'skrining_td', type: 'input', no: '', label: 'Cakupan Skrining TD', bg: '' }, // 23
        { id: 'status_td1', type: 'input', no: '', label: 'Status Td1', bg: '' }, // 24
        { id: 'status_td2', type: 'input', no: '', label: 'Status Td2', bg: '' }, // 25
        { id: 'status_td3', type: 'input', no: '', label: 'Status Td3', bg: '' }, // 26
        { id: 'status_td4', type: 'input', no: '', label: 'Status Td4', bg: '' }, // 27
        { id: 'status_td5', type: 'input', no: '', label: 'Status Td5', bg: '' }, // 28
        { id: 'h_pelayanan_td', type: 'subheader', no: '', label: 'Pelayanan TD', bg: 'bg-sky-50' }, // 29
        { id: 'cakupan_td1', type: 'input', no: '', label: 'Cakupan Td1', bg: '' }, // 30
        { id: 'cakupan_td2', type: 'input', no: '', label: 'Cakupan Td2', bg: '' }, // 31
        { id: 'cakupan_td3', type: 'input', no: '', label: 'Cakupan Td3', bg: '' }, // 32
        { id: 'cakupan_td4', type: 'input', no: '', label: 'Cakupan Td4', bg: '' }, // 33
        { id: 'cakupan_td5', type: 'input', no: '', label: 'Cakupan Td5', bg: '' }, // 34
        { id: 'cakupan_td2_plus', type: 'input', no: '', label: 'Cakupan Td2+', bg: '' }, // 35
        { id: 'cakupan_td_catin', type: 'input', no: '', label: 'Cakupan Td Catin', bg: '' }, // 36
        { id: 'h_3', type: 'subheader', no: '3', label: 'Pemberian Tablet Fe Bumil', bg: 'bg-gray-100' }, // 37
        { id: 'fe_dapat_ttd', type: 'input', no: '', label: 'Jumlah ibu hamil yang mendapatkan TTD 180 Tablet', bg: '' }, // 38
        { id: 'fe_konsumsi_ttd', type: 'input', no: '', label: 'Jumlah ibu hamil yang mengkonsumsi TTD 180 Tablet', bg: '' }, // 39
        { id: 'fe_dapat_mms', type: 'input', no: '', label: 'Jumlah ibu hamil yang mendapatkan MMS 180 Tablet', bg: '' }, // 40
        { id: 'fe_konsumsi_mms', type: 'input', no: '', label: 'Jumlah ibu hamil yang mengkonsumsi MMS 180 Tablet', bg: '' }, // 41
        { id: 'h_4', type: 'subheader', no: '4', label: 'Pelayanan Triple Eliminasi', bg: 'bg-gray-100' }, // 42
        { id: 'te_pelayanan', type: 'input', no: '', label: 'Jumlah ibu hamil mendapatkan pelayanan Triple Eliminasi', bg: '' }, // 43
        { id: 'te_hiv_periksa', type: 'input', no: '', label: 'Jumlah ibu hamil yang diperiksa HIV', bg: '' }, // 44
        { id: 'te_hiv_reaktif', type: 'input', no: '', label: 'Jumlah ibu hamil yang reaktif HIV', bg: '' }, // 45
        { id: 'te_hiv_tata', type: 'input', no: '', label: 'Jumlah ibu hamil reaktif HIV yang mendapat tatalaksana', bg: '' }, // 46
        { id: 'te_sif_periksa', type: 'input', no: '', label: 'Jumlah ibu hamil yang diperiksa Sifilis', bg: '' }, // 47
        { id: 'te_sif_tata', type: 'input', no: '', label: 'Jumlah ibu hamil reaktif Sifilis yang mendapat tatalaksana', bg: '' }, // 48
        { id: 'te_hep_periksa', type: 'input', no: '', label: 'Jumlah ibu hamil yang diperiksa Hepatitis B', bg: '' }, // 49
        { id: 'te_hep_tata', type: 'input', no: '', label: 'Jumlah ibu hamil reaktif Hepatitis B yang mendapat tatalaksana', bg: '' }, // 50
        { id: 'h_5', type: 'subheader', no: '5', label: 'Deteksi Resiko', bg: 'bg-gray-100' }, // 51
        { id: 'resiko_nakes', type: 'input', no: '', label: '- Oleh Tenaga Kesehatan', bg: '' }, // 52
        { id: 'resiko_masyarakat', type: 'input', no: '', label: '- Oleh Masyarakat', bg: '' }, // 53
        { id: 'h_6', type: 'subheader', no: '6', label: 'Kehamilan menurut umur ibu (total= K1)', bg: 'bg-gray-100' }, // 54
        { id: 'u_18', type: 'input', no: '', label: '- < 18 tahun', bg: '' }, // 55
        { id: 'u_18_20', type: 'input', no: '', label: '- 18 - 20 tahun', bg: '' }, // 56
        { id: 'u_20_34', type: 'input', no: '', label: '- 20 - 34 tahun', bg: '' }, // 57
        { id: 'u_35', type: 'input', no: '', label: '- ≥ 35 tahun', bg: '' }, // 58
        { id: 'h_7', type: 'subheader', no: '7', label: 'Umur kehamilan (total= K1)', bg: 'bg-gray-100' }, // 59
        { id: 'uk_0_12', type: 'input', no: '', label: '- 0 - 12 mgg ( = K1 Murni )', bg: '' }, // 60
        { id: 'uk_12_24', type: 'input', no: '', label: '- >12 - 24 mgg', bg: '' }, // 61
        { id: 'uk_24', type: 'input', no: '', label: '- > 24 mgg', bg: '' }, // 62
        { id: 'h_8', type: 'subheader', no: '8', label: 'Hamil yang ke (total= K1)', bg: 'bg-gray-100' }, // 63
        { id: 'hk_1', type: 'input', no: '', label: '- 1', bg: '' }, // 64
        { id: 'hk_2', type: 'input', no: '', label: '- 2', bg: '' }, // 65
        { id: 'hk_3', type: 'input', no: '', label: '- 3', bg: '' }, // 66
        { id: 'hk_4', type: 'input', no: '', label: '- 4', bg: '' }, // 67
        { id: 'hk_5', type: 'input', no: '', label: '- ≥ 5', bg: '' }, // 68
        { id: 'h_9', type: 'subheader', no: '9', label: 'Jarak kehamilan (total= K1-Hamil 1)', bg: 'bg-gray-100' }, // 69
        { id: 'jk_kurang_2', type: 'input', no: '', label: '- < 2 th', bg: '' }, // 70
        { id: 'jk_lebih_2', type: 'input', no: '', label: '- > 2 th', bg: '' }, // 71
        { id: 'h_10', type: 'subheader', no: '10', label: 'Ibu hamil yang diperiksa Hb', bg: 'bg-gray-100' }, // 72
        { id: 'hb_11_tm1', type: 'input', no: '', label: '- Hb < 11 gr% Pada Tm 1', bg: 'bg-sky-50' }, // 73
        { id: 'anemia_ringan_tm1', type: 'input', no: '', label: '* Anemia Ringan ( Hb 10-10,9 g/dl)', bg: '' }, // 74
        { id: 'anemia_sedang_tm1', type: 'input', no: '', label: '* Anemia Sedang ( Hb 7 -9,9 g/dl)', bg: '' }, // 75
        { id: 'anemia_berat_tm1', type: 'input', no: '', label: '* Anemia Berat ( Hb < 7 g/dl)', bg: '' }, // 76
        { id: 'hb_lebih_11', type: 'input', no: '', label: '- Hb > 11 gr%', bg: '' }, // 77
        { id: 'hb_11_tm3', type: 'input', no: '', label: '- HB < 11 gr% pada Tm 3', bg: 'bg-sky-50' }, // 78
        { id: 'anemia_ringan_tm3', type: 'input', no: '', label: '* Anemia Ringan ( Hb 10-10,9 g/dl)', bg: '' }, // 79
        { id: 'anemia_sedang_tm3', type: 'input', no: '', label: '* Anemia Sedang ( Hb 7 -9,9 g/dl)', bg: '' }, // 80
        { id: 'anemia_berat_tm3', type: 'input', no: '', label: '* Anemia Berat ( Hb < 7 g/dl)', bg: '' }, // 81
        { id: 'hb_diperiksa', type: 'input', no: '', label: 'Yang ibu Hamil yang di periksa HB', bg: '' }, // 82
        { id: 'hb_anemia', type: 'input', no: '', label: 'Jumlah ibu hamil mengalami anemia', bg: '' }, // 83
        { id: 'hb_anemia_ttd', type: 'input', no: '', label: 'Jumlah ibu hamil anemia ringan yang mendapatkan TTD oral', bg: '' }, // 84
        { id: 'hb_anemia_tata', type: 'input', no: '', label: 'Jumlah ibu hamil anemia sedang dan berat yang mendapatkan Tatalaksana di tingkat lanjut', bg: '' }, // 85
        { id: 'h_11', type: 'subheader', no: '11', label: 'Gizi Ibu Hamil', bg: 'bg-gray-100' }, // 86
        { id: 'gizi_lila', type: 'input', no: '', label: 'Jumlah ibu hamil diukur LILA dan / IMT', bg: '' }, // 87
        { id: 'gizi_resiko_kek', type: 'input', no: '', label: 'Jumlah Ibu Hamil resiko KEK ( IMT <18,5)', bg: '' }, // 88
        { id: 'gizi_kek', type: 'input', no: '', label: 'Jumlah Ibu Hamil Kurang Energi Kronik (KEK)/ Lila < 23,5 cm', bg: '' }, // 89
        { id: 'gizi_kek_pmt', type: 'input', no: '', label: 'Jumlah Ibu Hamil KEK mendapat Makanan Tambahan', bg: '' }, // 90
        { id: 'gizi_kek_konsumsi', type: 'input', no: '', label: 'Jumlah Ibu Hamil KEK mengkonsumsi Makanan Tambahan', bg: '' }, // 91
        { id: 'h_12', type: 'subheader', no: '12', label: 'Kelas Ibu Hamil', bg: 'bg-gray-100' }, // 92
        { id: 'kls_kia', type: 'input', no: '', label: 'Jumlah Ibu hamil Yang memiliki Buku KIA pada Kunjungan K1', bg: '' }, // 93
        { id: 'kls_ibu_4x', type: 'input', no: '', label: 'Jumlah Ibu hamil yang ikut kelas ibu Minimal 4x selama kehamilan', bg: '' }, // 94
        { id: 'kls_keluarga', type: 'input', no: '', label: 'Jumlah Keluarga yang ikut kelas Ibu', bg: '' }, // 95
        { id: 'h_13', type: 'subheader', no: '13', label: 'Komplikasi pada kehamilan dan persalinan :', bg: 'bg-gray-100' }, // 96
        { id: 'komp_abortus', type: 'input', no: '', label: '- Abortus', bg: '' }, // 97
        { id: 'komp_perdarahan', type: 'input', no: '', label: '- Perdarahan', bg: '' }, // 98
        { id: 'komp_mola', type: 'input', no: '', label: '- Mola Hidatidosa', bg: '' }, // 99
        { id: 'komp_ket', type: 'input', no: '', label: '- KET', bg: '' }, // 100
        { id: 'komp_placenta', type: 'input', no: '', label: '- Placenta Previa', bg: '' }, // 101
        { id: 'komp_solusio', type: 'input', no: '', label: '- Solusio Placenta', bg: '' }, // 102
        { id: 'komp_retensio', type: 'input', no: '', label: '- Retensio Placenta', bg: '' }, // 103
        { id: 'komp_rest', type: 'input', no: '', label: '- Rest Placenta', bg: '' }, // 104
        { id: 'komp_atonia', type: 'input', no: '', label: '- Atonia Uteri', bg: '' }, // 105
        { id: 'komp_ruptura', type: 'input', no: '', label: '- Ruptura Uteri', bg: '' }, // 106
        { id: 'komp_immatur', type: 'input', no: '', label: '- Partus Immatur', bg: '' }, // 107
        { id: 'komp_prematur', type: 'input', no: '', label: '- Partus Prematur', bg: '' }, // 108
        { id: 'komp_gameli', type: 'input', no: '', label: '- Gameli', bg: '' }, // 109
        { id: 'komp_preeklampsia', type: 'input', no: '', label: '- Preeklampsia', bg: '' }, // 110
        { id: 'komp_eklampsi', type: 'input', no: '', label: '- Eklampsi', bg: '' }, // 111
        { id: 'komp_hiper', type: 'input', no: '', label: '- Hiperemesis', bg: '' }, // 112
        { id: 'komp_kpd', type: 'input', no: '', label: '- KPD', bg: '' }, // 113
        { id: 'komp_lama', type: 'input', no: '', label: '- Partus lama', bg: '' }, // 114
        { id: 'komp_sero', type: 'input', no: '', label: '- Serotinus', bg: '' }, // 115
        { id: 'komp_kjdr', type: 'input', no: '', label: '- KJDR', bg: '' }, // 116
        { id: 'komp_lintang', type: 'input', no: '', label: '- Letak Lintang', bg: '' }, // 117
        { id: 'komp_sungsang', type: 'input', no: '', label: '- Letak Sungsang', bg: '' }, // 118
        { id: 'komp_distosia', type: 'input', no: '', label: '- Distosia Bahu', bg: '' }, // 119
        { id: 'komp_makro', type: 'input', no: '', label: '- Makrosomia', bg: '' }, // 120
        { id: 'komp_infeksi', type: 'input', no: '', label: '- Infeksi', bg: '' }, // 121
        { id: 'komp_tb', type: 'input', no: '', label: '- Tuberculosis', bg: '' }, // 122
        { id: 'komp_malaria', type: 'input', no: '', label: '- Malaria', bg: '' }, // 123
        { id: 'komp_jantung', type: 'input', no: '', label: '- Jantung', bg: '' }, // 124
        { id: 'komp_dm', type: 'input', no: '', label: '- DM', bg: '' }, // 125
        { id: 'komp_obesitas', type: 'input', no: '', label: '- Obesitas', bg: '' }, // 126
        { id: 'komp_lain', type: 'input', no: '', label: '- Penyebab lain', bg: '' }, // 127
        { id: 'h_14', type: 'subheader', no: '14', label: 'Skrining Ibu Hamil', bg: 'bg-gray-100' }, // 128
        { id: 'skrin_preeklam', type: 'input', no: '', label: 'Jumlah ibu hamil mendapatkan skrining preeklamsia ( Umur Kehamilan < 20 minggu )', bg: '' }, // 129
        { id: 'skrin_preeklam_tata', type: 'input', no: '', label: 'Jumlah ibu hamil dengan preeklamsia dan Eklamsia yang mendapatkan tatalaksana', bg: '' }, // 130
        { id: 'skrin_hdk', type: 'input', no: '', label: 'Jumlah ibu hamil mengalami HDK ( Tensi > 140/90 mmHg)', bg: '' }, // 131
        { id: 'skrin_hdk_tata', type: 'input', no: '', label: 'Jumlah ibu hamil HDK yang mendapatkan tatalaksana', bg: '' }, // 132
        { id: 'skrin_keswa1', type: 'input', no: '', label: 'Jumlah ibu hamil yang mendapatkan Skrining Keswa TM 1', bg: '' }, // 133
        { id: 'skrin_keswa3', type: 'input', no: '', label: 'Jumlah ibu hamil yang mendapatkan Skrining Keswa TM 3', bg: '' }, // 134
        { id: 'skrin_kie', type: 'input', no: '', label: 'Jumlah Ibu hamil mendapatkan konseling KIE', bg: '' }, // 135
        { id: 'skrin_pendarahan', type: 'input', no: '', label: 'Jumlah Ibu hamil mengalami perdarahan pasca salin', bg: '' }, // 136
        { id: 'h_b', type: 'header', no: '', label: 'SITUASI PERSALINAN & NIFAS', bg: 'bg-gray-200' }, // 137
        { id: 'h_15', type: 'subheader', no: '15', label: 'Jumlah Seluruh Persalinan', bg: 'bg-gray-100' }, // 138
        { id: 'salin_12t', type: 'input', no: '', label: 'Jumlah ibu bersalin yang mendapatkan pemeriksaan 12 T saat kehamilan', bg: '' }, // 139
        { id: 'h_penolong', type: 'subheader', no: '', label: 'Berdasarkan Penolong Persalinan :', bg: 'bg-sky-50' }, // 140
        { id: 'salin_nakes', type: 'input', no: '', label: '- Persalinan Nakes', bg: '' }, // 141
        { id: 'salin_non_nakes', type: 'input', no: '', label: '- Persalinan Non Nakes', bg: '' }, // 142
        { id: 'h_cara', type: 'subheader', no: '', label: 'Berdasarkan Cara Persalinan :', bg: 'bg-sky-50' }, // 143
        { id: 'salin_normal', type: 'input', no: '', label: '- Persalinan Normal', bg: '' }, // 144
        { id: 'salin_sc', type: 'input', no: '', label: '- Persalinan Sectio Caesaria', bg: '' }, // 145
        { id: 'sc_indikasi', type: 'input', no: '', label: '* Indikasi', bg: '' }, // 146
        { id: 'sc_minta', type: 'input', no: '', label: '* Permintaan Sendiri', bg: '' }, // 147
        { id: 'h_tempat', type: 'subheader', no: '', label: 'Tempat Persalinan Nakes :', bg: 'bg-sky-50' }, // 148
        { id: 'tempat_faskes', type: 'input', no: '', label: '- Persalinan Nakes di Faskes', bg: '' }, // 149
        { id: 'tempat_non_faskes', type: 'input', no: '', label: '- Persalinan Nakes Non Faskes', bg: '' }, // 150
        { id: 'h_biaya', type: 'subheader', no: '', label: 'Pembiayaan Persalinan:', bg: 'bg-sky-50' }, // 151
        { id: 'biaya_jkn', type: 'input', no: '', label: '- JKN', bg: '' }, // 152
        { id: 'biaya_umum', type: 'input', no: '', label: '- Umum', bg: '' }, // 153
        { id: 'biaya_imd', type: 'input', no: '', label: '- I M D', bg: '' }, // 154
        { id: 'biaya_asi', type: 'input', no: '', label: '- Asi Eksklusif', bg: '' }, // 155
        { id: 'nifas_vit_a', type: 'input', no: '16', label: 'Jumlah Ibu Nifas mendapat Vit A Nifas ( 2 Kapsul)', bg: 'bg-gray-100 font-medium' }, // 156
        { id: 'nifas_ttd', type: 'input', no: '17', label: 'Jumlah Ibu Nifas mendapat Tablet Tambah Darah (42 tablet selama Nifas)', bg: 'bg-gray-100 font-medium' }, // 157
        { id: 'h_18', type: 'subheader', no: '18', label: 'Persalinan Menurut Umur Ibu', bg: 'bg-gray-100' }, // 158
        { id: 'pu_18', type: 'input', no: '', label: '- < 18 tahun', bg: '' }, // 159
        { id: 'pu_18_20', type: 'input', no: '', label: '- 18 - 20 tahun', bg: '' }, // 160
        { id: 'pu_20_34', type: 'input', no: '', label: '- 20 - 34 tahun', bg: '' }, // 161
        { id: 'pu_35', type: 'input', no: '', label: '- ≥ 35 tahun', bg: '' }, // 162
        { id: 'h_19', type: 'subheader', no: '19', label: 'Persalinan yang ke :', bg: 'bg-gray-100' }, // 163
        { id: 'pk_1', type: 'input', no: '', label: '- 1', bg: '' }, // 164
        { id: 'pk_2', type: 'input', no: '', label: '- 2', bg: '' }, // 165
        { id: 'pk_3', type: 'input', no: '', label: '- 3', bg: '' }, // 166
        { id: 'pk_4', type: 'input', no: '', label: '- 4', bg: '' }, // 167
        { id: 'pk_5', type: 'input', no: '', label: '- ≥ 5', bg: '' }, // 168
        { id: 'h_20', type: 'subheader', no: '20', label: 'Jarak Persalinan', bg: 'bg-gray-100' }, // 169
        { id: 'jp_kurang_2', type: 'input', no: '', label: 'Jarak Persalinan Kurang dari 2 tahun', bg: '' }, // 170
        { id: 'h_21', type: 'subheader', no: '21', label: 'Kunjungan Ibu Nifas :', bg: 'bg-gray-100' }, // 171
        { id: 'kf_1', type: 'input', no: '', label: '- KF 1 ( 6 Jam - 2 hari)', bg: '' }, // 172
        { id: 'kf_2', type: 'input', no: '', label: '- KF 2 ( 3 - 7 hari)', bg: '' }, // 173
        { id: 'kf_3', type: 'input', no: '', label: '- KF 3 / KF Lengkap (8 - 28 hari)', bg: '' }, // 174
        { id: 'kf_4', type: 'input', no: '', label: '- KF 4 / KF Lengkap (29 - 42 hari , dan telah diperiksa KF1, dan KF2 Sebelumnya )', bg: '' }, // 175
        { id: 'h_22', type: 'subheader', no: '22', label: 'Pelayanan Kesehatan Ibu & Reproduksi', bg: 'bg-gray-100' }, // 176
        { id: 'rep_desa', type: 'input', no: '', label: 'Jumlah desa / Kel. melaksanakan P4K', bg: '' }, // 177
        { id: 'rep_pusk', type: 'input', no: '', label: 'Jumlah Puskesmas Yang Melaksanakan P4K', bg: '' }, // 178
        { id: 'rep_rtk', type: 'input', no: '', label: 'Jumlah Rumah Tunggu Kelahiran (RTK) yang terbentuk', bg: '' }, // 179
        { id: 'rep_fas', type: 'input', no: '', label: 'Jumlah Ibu Hamil yang menggunakan fasilitas RTK', bg: '' } // 180
    ];

    // Placeholder untuk template Anak (Nantinya kamu bisa isi sesuai format Excel laporan anak)
    const templateAnak = [
        { id: 'header_A', type: 'header', no: 'A.', label: 'SITUASI KESEHATAN ANAK', bg: '' },
        { id: 'contoh_anak_1', type: 'input', no: '1', label: 'Contoh Data Anak 1', bg: '' },
        // ... dst
    ];

    // Menentukan template mana yang di-render berdasarkan URL
    const activeTemplate = kategori === 'ibu' ? templateIbu : templateAnak;

    // Mengambil Data dari Google Sheets
    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Tambahkan timestamp untuk mencegah browser melakukan caching
            const timestamp = new Date().getTime();
            const response = await fetch(
                `/api/get-sheet?spreadsheetId=${spreadsheetId}&kategori=${kategori}&bulan=${bulan}&t=${timestamp}`
            );
            const result = await response.json();

            if (response.ok && result.success && result.values) {
                // Mapping kembali array dari Google Sheets ke dalam object formData
                // Urutan index 0-22 harus sama dengan urutan di templateIbu
                // Bersihkan spasi berlebih pada semua data yang diambil dari Google Sheets
                const v = result.values.map(row => {
                    if (row && row[0]) {
                        return [String(row[0]).trim()];
                    }
                    return row || [];
                });
                const mappingData = {
                    k1_murni: v[2]?.[0] || "", k1_luar: v[3]?.[0] || "", k1_akses: v[4]?.[0] || "",
                    k1_dokter: v[5]?.[0] || "", k1_usg: v[6]?.[0] || "", hamil_tdk_diinginkan: v[7]?.[0] || "",
                    bumil_4t: v[8]?.[0] || "", t_muda: v[9]?.[0] || "", t_tua: v[10]?.[0] || "",
                    t_rapat: v[11]?.[0] || "", t_banyak: v[12]?.[0] || "", persen_4t: v[13]?.[0] || "",
                    k4: v[14]?.[0] || "", k5_dokter: v[15]?.[0] || "", k5_usg: v[16]?.[0] || "",
                    k6: v[17]?.[0] || "", anc_8x: v[18]?.[0] || "", anc_12t: v[19]?.[0] || "",
                    bumil_periksa: v[20]?.[0] || "", bumil_kia: v[21]?.[0] || "", skrining_td: v[23]?.[0] || "",
                    status_td1: v[24]?.[0] || "", status_td2: v[25]?.[0] || "", status_td3: v[26]?.[0] || "",
                    status_td4: v[27]?.[0] || "", status_td5: v[28]?.[0] || "", cakupan_td1: v[30]?.[0] || "",
                    cakupan_td2: v[31]?.[0] || "", cakupan_td3: v[32]?.[0] || "", cakupan_td4: v[33]?.[0] || "",
                    cakupan_td5: v[34]?.[0] || "", cakupan_td2_plus: v[35]?.[0] || "", cakupan_td_catin: v[36]?.[0] || "",
                    fe_dapat_ttd: v[38]?.[0] || "", fe_konsumsi_ttd: v[39]?.[0] || "", fe_dapat_mms: v[40]?.[0] || "",
                    fe_konsumsi_mms: v[41]?.[0] || "", te_pelayanan: v[43]?.[0] || "", te_hiv_periksa: v[44]?.[0] || "",
                    te_hiv_reaktif: v[45]?.[0] || "", te_hiv_tata: v[46]?.[0] || "", te_sif_periksa: v[47]?.[0] || "",
                    te_sif_tata: v[48]?.[0] || "", te_hep_periksa: v[49]?.[0] || "", te_hep_tata: v[50]?.[0] || "",
                    resiko_nakes: v[52]?.[0] || "", resiko_masyarakat: v[53]?.[0] || "", u_18: v[55]?.[0] || "",
                    u_18_20: v[56]?.[0] || "", u_20_34: v[57]?.[0] || "", u_35: v[58]?.[0] || "",
                    uk_0_12: v[60]?.[0] || "", uk_12_24: v[61]?.[0] || "", uk_24: v[62]?.[0] || "",
                    hk_1: v[64]?.[0] || "", hk_2: v[65]?.[0] || "", hk_3: v[66]?.[0] || "",
                    hk_4: v[67]?.[0] || "", hk_5: v[68]?.[0] || "", jk_kurang_2: v[70]?.[0] || "",
                    jk_lebih_2: v[71]?.[0] || "", hb_11_tm1: v[73]?.[0] || "", anemia_ringan_tm1: v[74]?.[0] || "",
                    anemia_sedang_tm1: v[75]?.[0] || "", anemia_berat_tm1: v[76]?.[0] || "", hb_lebih_11: v[77]?.[0] || "",
                    hb_11_tm3: v[78]?.[0] || "", anemia_ringan_tm3: v[79]?.[0] || "", anemia_sedang_tm3: v[80]?.[0] || "",
                    anemia_berat_tm3: v[81]?.[0] || "", hb_diperiksa: v[82]?.[0] || "", hb_anemia: v[83]?.[0] || "",
                    hb_anemia_ttd: v[84]?.[0] || "", hb_anemia_tata: v[85]?.[0] || "", gizi_lila: v[87]?.[0] || "",
                    gizi_resiko_kek: v[88]?.[0] || "", gizi_kek: v[89]?.[0] || "", gizi_kek_pmt: v[90]?.[0] || "",
                    gizi_kek_konsumsi: v[91]?.[0] || "", kls_kia: v[93]?.[0] || "", kls_ibu_4x: v[94]?.[0] || "",
                    kls_keluarga: v[95]?.[0] || "", komp_abortus: v[97]?.[0] || "", komp_perdarahan: v[98]?.[0] || "",
                    komp_mola: v[99]?.[0] || "", komp_ket: v[100]?.[0] || "", komp_placenta: v[101]?.[0] || "",
                    komp_solusio: v[102]?.[0] || "", komp_retensio: v[103]?.[0] || "", komp_rest: v[104]?.[0] || "",
                    komp_atonia: v[105]?.[0] || "", komp_ruptura: v[106]?.[0] || "", komp_immatur: v[107]?.[0] || "",
                    komp_prematur: v[108]?.[0] || "", komp_gameli: v[109]?.[0] || "", komp_preeklampsia: v[110]?.[0] || "",
                    komp_eklampsi: v[111]?.[0] || "", komp_hiper: v[112]?.[0] || "", komp_kpd: v[113]?.[0] || "",
                    komp_lama: v[114]?.[0] || "", komp_sero: v[115]?.[0] || "", komp_kjdr: v[116]?.[0] || "",
                    komp_lintang: v[117]?.[0] || "", komp_sungsang: v[118]?.[0] || "", komp_distosia: v[119]?.[0] || "",
                    komp_makro: v[120]?.[0] || "", komp_infeksi: v[121]?.[0] || "", komp_tb: v[122]?.[0] || "",
                    komp_malaria: v[123]?.[0] || "", komp_jantung: v[124]?.[0] || "", komp_dm: v[125]?.[0] || "",
                    komp_obesitas: v[126]?.[0] || "", komp_lain: v[127]?.[0] || "", skrin_preeklam: v[129]?.[0] || "",
                    skrin_preeklam_tata: v[130]?.[0] || "", skrin_hdk: v[131]?.[0] || "", skrin_hdk_tata: v[132]?.[0] || "",
                    skrin_keswa1: v[133]?.[0] || "", skrin_keswa3: v[134]?.[0] || "", skrin_kie: v[135]?.[0] || "",
                    skrin_pendarahan: v[136]?.[0] || "", salin_12t: v[139]?.[0] || "", salin_nakes: v[141]?.[0] || "",
                    salin_non_nakes: v[142]?.[0] || "", salin_normal: v[144]?.[0] || "", salin_sc: v[145]?.[0] || "",
                    sc_indikasi: v[146]?.[0] || "", sc_minta: v[147]?.[0] || "", tempat_faskes: v[149]?.[0] || "",
                    tempat_non_faskes: v[150]?.[0] || "", biaya_jkn: v[152]?.[0] || "", biaya_umum: v[153]?.[0] || "",
                    biaya_imd: v[154]?.[0] || "", biaya_asi: v[155]?.[0] || "", nifas_vit_a: v[156]?.[0] || "",
                    nifas_ttd: v[157]?.[0] || "", pu_18: v[159]?.[0] || "", pu_18_20: v[160]?.[0] || "",
                    pu_20_34: v[161]?.[0] || "", pu_35: v[162]?.[0] || "", pk_1: v[164]?.[0] || "",
                    pk_2: v[165]?.[0] || "", pk_3: v[166]?.[0] || "", pk_4: v[167]?.[0] || "",
                    pk_5: v[168]?.[0] || "", jp_kurang_2: v[170]?.[0] || "", kf_1: v[172]?.[0] || "",
                    kf_2: v[173]?.[0] || "", kf_3: v[174]?.[0] || "", kf_4: v[175]?.[0] || "",
                    rep_desa: v[177]?.[0] || "", rep_pusk: v[178]?.[0] || "", rep_rtk: v[179]?.[0] || "",
                    rep_fas: v[180]?.[0] || ""
                };
                setFormData(mappingData);
            }
        } catch (error) {
            console.error("Gagal memuat data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Jalankan fungsi fetchData setiap kali halaman dibuka
    useEffect(() => {
        fetchData();
    }, [spreadsheetId, kategori, bulan]);

    return (
        <div className="min-h-screen bg-gray-50 p-6 pb-20">
            {/* Header & Navigasi */}
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200 sticky top-4 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                    >
                        <i className="ri-arrow-left-line"></i> Kembali
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-sky-700 capitalize">Input Laporan {kategori}</h1>
                        <p className="text-sm text-gray-500 capitalize">Desa: {namaDesaFormat} | Periode: {bulan}</p>
                    </div>
                </div>

                <button
                    onClick={handleSimpan}
                    disabled={isLoading}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-white shadow-md transition-colors ${isLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                        }`}
                >
                    <i className={isLoading ? "ri-loader-4-line animate-spin" : "ri-save-3-line"}></i>
                    {isLoading ? "Menyimpan..." : "Simpan Data"}
                </button>
            </div>

            {/* Kertas Spreadsheet */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-300 max-w-5xl mx-auto overflow-x-auto">

                {/* Kop Laporan (Statis) */}
                <div className="text-center mb-6">
                    <h2 className="text-lg font-bold leading-tight uppercase">FORMAT REKAPITULASI LAPORAN LB3 {kategori}</h2>
                    <h2 className="text-lg font-bold leading-tight">KABUPATEN SIDENRENG RAPPANG</h2>
                    <h2 className="text-lg font-bold leading-tight">TAHUN 2026</h2>
                </div>

                <div className="mb-4 flex flex-col gap-1">
                    <p className="font-bold text-sm">Puskesmas <span className="ml-[18px]">: DONGI</span></p>
                    <p className="font-bold text-sm">DESA/KEL <span className="ml-[25px]">: {namaDesaFormat}</span></p>
                </div>

                {/* Tabel Laporan */}
                <table className="w-full border-collapse border border-black text-sm">
                    <thead>
                        <tr>
                            <th className="border border-black p-2 w-12 text-center bg-gray-50" rowSpan={2}>NO.</th>
                            <th className="border border-black p-2 text-center bg-gray-50" rowSpan={2}>URAIAN KEGIATAN</th>
                            <th className="border border-black p-1 text-center w-32 bg-gray-50">BULAN</th>
                        </tr>
                        <tr>
                            <th className="border border-black p-1 text-center uppercase bg-gray-50">{singkatanBulan}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeTemplate.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50/50">
                                {/* Kolom No */}
                                <td className={`border border-black px-2 py-1 text-center font-bold ${row.bg}`}>
                                    {row.no}
                                </td>

                                {/* Kolom Uraian */}
                                <td className={`border border-black px-2 py-1 ${row.bg} ${row.type === 'header' || row.type === 'subheader' ? 'font-bold italic' : ''}`}>
                                    {row.label}
                                </td>

                                {/* Kolom Input Data */}
                                <td className={`border border-black p-0 relative ${row.bg}`}>
                                    {row.type === 'input' ? (
                                        <input
                                            type="number"
                                            value={formData[row.id] || ''}
                                            onChange={(e) => handleChange(e, row.id)}
                                            className={`w-full h-full min-h-[32px] px-2 outline-none text-center focus:bg-yellow-100 transition-colors bg-transparent`}
                                        />
                                    ) : (
                                        // Area kosong untuk baris header/subheader
                                        <div className="w-full h-full min-h-[32px] bg-gray-100/30"></div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}