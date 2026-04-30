import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function InputData() {
    const { desa, bulan, spreadsheetId, kategori } = useParams();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [tableData, setTableData] = useState([]);

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
                    const no = row[0] || "";
                    const uraian = row[1] || "";

                    // Header HARUS huruf besar semua, panjangnya lebih dari 12 huruf, dan TIDAK diawali tanda strip (-) atau bintang (*)
                    const isHeader = /^[A-Z]\./.test(no) || (uraian === uraian.toUpperCase() && uraian.length > 12 && !uraian.trim().startsWith('-') && !uraian.trim().startsWith('*'));
                    const isSubheader = /^[0-9]+/.test(no);
                    const isBlank = no.trim() === "" && uraian.trim() === "";

                    // Panggil detektor warna di sini!
                    const customColor = getCustomColor(uraian);

                    if (kategori === 'anak') {
                        const nilaiL = row[2] || "";
                        const nilaiP = row[3] || "";
                        const nilaiTotal = row[4] || "";
                        return { no, label: uraian, valueL: nilaiL, valueP: nilaiP, valueTotal: nilaiTotal, isHeader, isSubheader, isBlank, customColor };
                    } else {
                        const nilai = row[2] || "";
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
        setIsLoading(true);

        let valuesToSave;
        if (kategori === 'anak') {
            valuesToSave = tableData.map(row => [row.valueL || "", row.valueP || ""]);
        } else {
            valuesToSave = tableData.map(row => [row.value || ""]);
        }

        try {
            const response = await fetch('/api/update-sheet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ spreadsheetId, kategori, bulan, data: valuesToSave }),
            });

            const result = await response.json();
            if (response.ok && result.success) alert("Data laporan berhasil diperbarui!");
            else throw new Error("Gagal menyimpan data");
        } catch (error) {
            alert("Terjadi kesalahan: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 pb-20">
            {/* Navigasi Atas */}
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200 sticky top-4 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700 font-medium transition-colors cursor-pointer">
                        <i className="ri-arrow-left-line"></i> Kembali
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-sky-700 capitalize">Input Laporan {kategori}</h1>
                        <p className="text-sm text-gray-500 capitalize">Desa: {namaDesaFormat} | Periode: {bulan}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <a
                        href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 shadow-sm transition-colors"
                        title="Buka Spreadsheet di Tab Baru"
                    >
                        <i className="ri-file-excel-2-line"></i>
                        Buka Spreadsheet
                    </a>

                    <button onClick={handleSimpan} disabled={isLoading} className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-white shadow-md transition-colors cursor-pointer ${isLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
                        <i className={isLoading ? "ri-loader-4-line animate-spin" : "ri-save-3-line"}></i>
                        {isLoading ? "Menyimpan..." : "Simpan Data"}
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

                <table className="w-full border-collapse border border-black text-sm">
                    <thead>
                        {kategori === 'anak' ? (
                            <>
                                <tr>
                                    <th className="border border-black p-2 w-12 text-center bg-gray-50" rowSpan={3}>NO</th>
                                    <th className="border border-black p-2 text-center bg-gray-50 uppercase" rowSpan={3}>INDIKATOR</th>
                                    <th className="border border-black p-1 text-center uppercase bg-gray-50" colSpan={3}>{bulan.toUpperCase()}</th>
                                </tr>
                                <tr>
                                    <th className="border border-black p-1 text-center bg-gray-50" colSpan={2}>JUMLAH</th>
                                    <th className="border border-black p-1 text-center bg-gray-50" rowSpan={2}>TOTAL</th>
                                </tr>
                                <tr>
                                    <th className="border border-black p-1 text-center font-bold bg-blue-100 w-16">L</th>
                                    <th className="border border-black p-1 text-center font-bold bg-pink-100 w-16">P</th>
                                </tr>
                            </>
                        ) : (
                            <>
                                <tr>
                                    <th className="border border-black p-2 w-12 text-center bg-gray-50" rowSpan={2}>NO.</th>
                                    <th className="border border-black p-2 text-center bg-gray-50" rowSpan={2}>URAIAN KEGIATAN</th>
                                    <th className="border border-black p-1 text-center w-32 bg-gray-50">BULAN</th>
                                </tr>
                                <tr>
                                    <th className="border border-black p-1 text-center uppercase bg-gray-50">{singkatanBulan}</th>
                                </tr>
                            </>
                        )}
                    </thead>
                    <tbody>
                        {tableData.map((row, index) => {
                            // Default: gunakan customColor dari hasil deteksi fungsi getCustomColor
                            let rowBg = row.customColor;
                            let labelStyle = '';
                            let showInput = true;

                            // Aturan Utama (Timpa warna jika itu Header/Subheader/Kosong)
                            if (row.isBlank) {
                                showInput = false;
                                rowBg = 'bg-white';
                            } else if (row.isHeader) {
                                showInput = false;
                                rowBg = 'bg-gray-400';
                                labelStyle = 'font-bold text-[15px] text-gray-800';
                            } else if (row.isSubheader) {
                                // TIDAK LAGI mematikan showInput. Subheader bernomor ("1", "4", "5", dst) tetap bisa diisi!
                                rowBg = 'bg-gray-300';
                                labelStyle = 'font-bold text-gray-800';
                            }

                            // -------------------------------------------------------------
                            // FITUR MAPPING MANUAL: DAFTAR BARIS YANG TIDAK BOLEH DIISI (TOTAL KOSONG)
                            // Silakan tambahkan nama "INDIKATOR" lain ke dalam tanda kurung siku ini jika ingin dinonaktifkan
                            const barisReadonly = [
                                "Dasar",
                                "Situasi Kelahiran",
                                "Kunjungan Bayi ( 29 Hari - 11 bulan )",
                                // "Contoh Indikator Lain Yang Tidak Boleh Diisi",
                            ];

                            // FITUR MAPPING MANUAL: DAFTAR BARIS YANG PUNYA RUMUS (NILAI TETAP TAMPIL)
                            // Baris di bawah ini tidak akan bisa diisi, tapi hasil rumusnya akan terlihat
                            const barisRumus = [
                                "Persentase Balita yang dipantau pertumbuhan dan perkembangannya",
                                "Cakupan balita sakit dilayani menggunakan MTBS di FKTP",
                                "- Sasaran Bayi Baru Lahir",
                                "Lahir Hidup :",
                                "Persentase bayi baru lahir dari ibu yang positip HIV dan sifilis mendapatkan deteksi dini HIV dan sifilis dalam suatu wilayah",
                                "Persentase seluruh bayi baru lahir hidup dari ibu yang positif HIV, sifilis dan hepatitis B mendapatkan tatalaksana sesuai standar dalam suatu wilayah",
                                "Persentase bayi lahir prematur (<37 minggu)",
                                "Cakupan Bayi baru lahir dengan asfiksia neonatorum",
                                "Cakupan Bayi baru lahir dengan asifiksia neonatorum yang mendapat tata laksana",
                                "Persentase bayi baru lahir dengan berat lahir rendah mendapat tata laksana",
                                "Asuhan Neonatal 0 - 6 Jam",
                                "Cakupan KN 1",
                                "Cakupan Kunjungan Neonatal (KN) lengkap sesuai standar",
                                "Cakupan Bayi Baru Lahir Yang Dilakukan SHK",
                                "Absolut Neonatus Komplikasi",
                                "Persentase Neonatus Komplikasi",
                                "Jumlah Komplikasi pada Neonatus :",
                                "Covid 19 dan Suspek",
                                "Kby Lengkap ( Kunjungan 1 s/d 4 kali sampai pada ulang tahun yg pertama )",
                                "Persentase Kunjungan Bayi dalam bulan berjalan",
                                "Balita yang dipantau pertumbuhan dan perkembangannya (balita usia 0-59 bulan yang yang dipantau pertumbuhan dan perkembangan)",
                                "Persentase Balita yang dipantau pertumbuhan dan perkembangannya",
                                "Kunjungan Anak Balita  Usia 12 - 23 Bulan",
                                "- Usia 12 bulan",
                                "Kunjungan Anak Balita Usia 24 - 35 Bulan",
                                "Kunjungan Anak Balita  Usia 36 - 59 Bulan",
                                "Total Anak Balita Usia 0 - 60 Bulan (Sesuai Usia/Waktu SDIDTK)",
                                "Jumlah Balita  yang Dilayani SDIDTK",
                                "Jumlah Kunjungan Balita Sakit di FKTP",
                                "Jumlah balita sakit dilayani menggunakan MTBS di FKTP",
                                "Balita Memiliki Buku KIA",
                                // tambahkan nama indikator yang berisi rumus lainnya di sini
                            ];

                            const isRumus = barisRumus.includes(row.label.trim());

                            // Jika nama label ada di salah satu daftar di atas, matikan kotak inputnya
                            if (barisReadonly.includes(row.label.trim()) || isRumus) {
                                showInput = false;
                            }

                            // Berikan warna latar abu-abu (gray-200) khusus untuk baris yang berisi rumus
                            if (isRumus) {
                                rowBg = 'bg-gray-200';
                            }
                            // -------------------------------------------------------------

                            return (
                                <tr key={index} className="hover:bg-gray-100/50">
                                    <td className={`border border-black px-2 py-1.5 text-center font-bold ${rowBg}`}>
                                        {row.no}
                                    </td>

                                    <td className={`border border-black px-3 py-1.5 ${rowBg} ${labelStyle}`}>
                                        {row.label}
                                    </td>

                                    {kategori === 'anak' ? (
                                        <>
                                            <td className={`border border-black p-0 relative ${rowBg}`}>
                                                {showInput ? (
                                                    <input
                                                        type="number"
                                                        value={row.valueL}
                                                        onChange={(e) => handleChangeAnak(index, 'L', e.target.value)}
                                                        className={`w-full h-full min-h-[34px] px-1 outline-none text-center focus:bg-blue-100 transition-colors bg-transparent`}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full min-h-[34px] bg-transparent flex items-center justify-center font-bold text-gray-700">
                                                        {isRumus ? row.valueL : ""}
                                                    </div>
                                                )}
                                            </td>
                                            <td className={`border border-black p-0 relative ${rowBg}`}>
                                                {showInput ? (
                                                    <input
                                                        type="number"
                                                        value={row.valueP}
                                                        onChange={(e) => handleChangeAnak(index, 'P', e.target.value)}
                                                        className={`w-full h-full min-h-[34px] px-1 outline-none text-center focus:bg-pink-100 transition-colors bg-transparent`}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full min-h-[34px] bg-transparent flex items-center justify-center font-bold text-gray-700">
                                                        {isRumus ? row.valueP : ""}
                                                    </div>
                                                )}
                                            </td>
                                            <td className={`border border-black p-0 relative text-center font-bold text-gray-700 bg-gray-100`}>
                                                {showInput || isRumus ? row.valueTotal : ""}
                                            </td>
                                        </>
                                    ) : (
                                        <td className={`border border-black p-0 relative ${rowBg}`}>
                                            {showInput ? (
                                                <input
                                                    type="number"
                                                    value={row.value}
                                                    onChange={(e) => handleChange(index, e.target.value)}
                                                    className={`w-full h-full min-h-[34px] px-2 outline-none text-center focus:bg-yellow-200 transition-colors bg-transparent`}
                                                />
                                            ) : (
                                                <div className="w-full h-full min-h-[34px] bg-transparent flex items-center justify-center font-bold text-gray-700">
                                                    {isRumus ? row.value : ""}
                                                </div>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}