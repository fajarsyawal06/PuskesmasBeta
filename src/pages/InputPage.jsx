import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { showSuccessAlert, showErrorAlert, showWarningAlert, showConfirmAlert } from '../utils/alertUtils';
import AnakTable from '../components/AnakTable';
import IbuTable from '../components/IbuTable';
import { barisSatuKolom } from '../config/tableConfig';

export default function InputData() {
    const { desa, bulan, spreadsheetId, kategori } = useParams();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [adminRekapIds, setAdminRekapIds] = useState({ ibu: "", anak: "" });

    const namaDesaFormat = desa ? desa.replace('Desa-', '').replace('-', ' ').toUpperCase() : '';
    const singkatanBulan = bulan ? bulan.substring(0, 3).toUpperCase() : '';

    // === FUNGSI DETEKTOR WARNA PINTAR ===
    const getCustomColor = (teks) => {
        const lowerTeks = teks.toLowerCase();

        // 2. Warna Orange (Untuk kategori 4T / Terlalu)
        if (lowerTeks.includes('4t') || lowerTeks.includes('terlalu')) {
            return 'bg-orange-100';
        }

        return ''; // Default (Tidak ada warna khusus)
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `/api/get-sheet?spreadsheetId=${spreadsheetId}&kategori=${kategori}&bulan=${bulan}`
            );
            const result = await response.json();

            if (response.ok && result.success && result.values) {
                const formattedData = result.values.map((row) => {
                    // Karena kita menggunakan UNFORMATTED_VALUE, nilai bisa berupa Angka (Number). 
                    // Kita harus mengubahnya menjadi String agar tidak error saat dipanggil .trim()
                    const no = String(row[0] ?? "");
                    const uraian = String(row[1] ?? "");

                    // Header HARUS huruf besar semua, panjangnya lebih dari 12 huruf, dan TIDAK diawali tanda strip (-) atau bintang (*)
                    const isHeader = /^[A-Z]\./.test(no) || (uraian === uraian.toUpperCase() && uraian.length > 12 && !uraian.trim().startsWith('-') && !uraian.trim().startsWith('*'));
                    const isSubheader = /^[0-9]+/.test(no);
                    const isBlank = no.trim() === "" && uraian.trim() === "";

                    // Panggil detektor warna di sini!
                    const customColor = getCustomColor(uraian);

                    if (kategori === 'anak') {
                        // Gunakan ?? (Nullish Coalescing) alih-alih || agar angka 0 tidak hilang
                        const nilaiL = row[2] ?? "";
                        const nilaiP = row[3] ?? "";
                        const nilaiTotal = row[4] ?? "";
                        return { no, label: uraian, valueL: nilaiL, valueP: nilaiP, valueTotal: nilaiTotal, isHeader, isSubheader, isBlank, customColor };
                    } else {
                        const nilai = row[2] ?? "";
                        return { no, label: uraian, value: nilai, isHeader, isSubheader, isBlank, customColor };
                    }
                });

                setTableData(formattedData);
            }
        } catch (error) {
            console.error("Gagal memuat data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchAdminIds = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "users"));
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.role === 'admin') {
                        setAdminRekapIds({ ibu: data.rekapIbuId || "", anak: data.rekapAnakId || "" });
                    }
                });
            } catch (error) {
                console.error("Gagal mengambil ID rekap admin dari Firestore:", error);
            }
        };

        fetchAdminIds();
        fetchData();
    }, [spreadsheetId, kategori, bulan]);

    const handleChange = (index, newValue) => {
        const newData = [...tableData];
        newData[index].value = newValue;
        setTableData(newData);
    };

    const handleChangeAnak = (index, type, newValue) => {
        const newData = [...tableData];
        if (type === 'L') newData[index].valueL = newValue;
        if (type === 'P') newData[index].valueP = newValue;
        setTableData(newData);
    };

    const handleSimpan = async () => {
        const isConfirmed = await showConfirmAlert(
            'Apakah Anda yakin?',
            'Pastikan semua data yang diinput sudah benar sebelum disimpan ke sistem.',
            'Ya, Simpan Data!',
            'Batal'
        );

        if (!isConfirmed) {
            return; // Jika user menekan batal, hentikan fungsi simpan
        }

        setIsLoading(true);

        let valuesToSave;
        if (kategori === 'anak') {
            valuesToSave = tableData.map((row) => {
                const isSatuKolom = barisSatuKolom.includes(row.label?.trim());

                if (isSatuKolom) {
                    // Karena di-merge horizontal (L, P, Total jadi 1), kita hanya kirim ke kolom pertama (L),
                    // dan kirim null untuk P dan Total agar merge di Spreadsheet tidak rusak.
                    return [row.valueL ?? "", null, null];
                }

                const l = row.valueL ?? "";
                const p = row.valueP ?? "";
                let total = "";

                // Tampilkan total 0 secara paksa pada spreadsheet asalkan baris ini adalah baris data (bukan Judul/Kosong)
                if (!row.isHeader && !row.isBlank) {
                    total = (Number(l) || 0) + (Number(p) || 0);
                }

                return [l, p, total];
            });
        } else {
            valuesToSave = tableData.map(row => [row.value ?? ""]);
        }

        try {
            const response = await fetch('/api/update-sheet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    spreadsheetId,
                    kategori,
                    bulan,
                    desa,
                    data: valuesToSave,
                    rekapIbuId: adminRekapIds.ibu,
                    rekapAnakId: adminRekapIds.anak
                }),
            });

            const result = await response.json();
            if (response.ok && result.success) {
                if (result.warning) {
                    showWarningAlert('Tersimpan Sebagian', result.warning);
                } else {
                    showSuccessAlert('Berhasil!', 'Data laporan berhasil diperbarui!');
                }
            }
            else throw new Error("Gagal menyimpan data");
        } catch (error) {
            showErrorAlert('Gagal', 'Terjadi kesalahan: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 pb-20">
            {/* Navigasi Atas */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button onClick={() => navigate(-1)} className="flex items-center justify-center p-2 md:px-4 md:py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700 font-medium transition-colors cursor-pointer shrink-0">
                        <i className="ri-arrow-left-line text-lg md:text-base"></i> <span className="hidden md:inline ml-2">Kembali</span>
                    </button>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-base md:text-xl font-bold text-sky-700 capitalize truncate">Laporan {kategori}</h1>
                        <p className="text-xs text-gray-500 capitalize truncate">{namaDesaFormat} | {bulan}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <a
                        href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 md:flex-none flex justify-center items-center gap-1 md:gap-2 px-2 py-2 md:px-4 md:py-2 rounded-lg font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 shadow-sm transition-colors text-xs md:text-base"
                        title="Buka Spreadsheet di Tab Baru"
                    >
                        <i className="ri-file-excel-2-line text-sm md:text-base"></i>
                        <span className="hidden sm:inline">Spreadsheet</span>
                        <span className="sm:hidden">Sheet</span>
                    </a>

                    <button onClick={handleSimpan} disabled={isLoading} className={`flex-1 md:flex-none flex justify-center items-center gap-1 md:gap-2 px-2 py-2 md:px-6 md:py-2 rounded-lg font-bold text-white shadow-md transition-colors cursor-pointer text-xs md:text-base ${isLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
                        <i className={isLoading ? "ri-loader-4-line animate-spin text-sm md:text-base" : "ri-save-3-line text-sm md:text-base"}></i>
                        {isLoading ? "Menyimpan" : "Simpan Data"}
                    </button>
                </div>
            </div>

            {/* Tabel Spreadsheet */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-300 max-w-5xl mx-auto overflow-x-auto">
                <div className="text-center mb-6">
                    <h2 className="text-lg font-bold leading-tight uppercase">FORMAT REKAPITULASI LAPORAN LB3 {kategori}</h2>
                    <h2 className="text-lg font-bold leading-tight">KABUPATEN SIDENRENG RAPPANG</h2>
                    <h2 className="text-lg font-bold leading-tight">TAHUN 2026</h2>
                </div>

                <div className="mb-4 flex flex-col gap-1">
                    <p className="font-bold text-sm">Puskesmas <span className="ml-[18px]">: DONGI</span></p>
                    <p className="font-bold text-sm">DESA/KEL <span className="ml-[25px]">: {namaDesaFormat}</span></p>
                </div>

                {kategori === 'anak' ? (
                    <AnakTable
                        bulan={bulan}
                        tableData={tableData}
                        handleChangeAnak={handleChangeAnak}
                    />
                ) : (
                    <IbuTable
                        singkatanBulan={singkatanBulan}
                        tableData={tableData}
                        handleChange={handleChange}
                    />
                )}
            </div>
        </div>
    );
}