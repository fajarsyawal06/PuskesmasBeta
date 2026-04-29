import { useState } from "react";
import { useNavigate } from "react-router-dom";

// 1. Definisikan Map ID Spreadsheet di sini (atau import jika ditaruh di file terpisah)
const SPREADSHEET_MAP = {
    "Desa-dongi": "1ck3s1DVJStvVzNofg-1Lb-QA8e2o8YuAmZwrJfqLZPQ",
    "Desa-otting": "ID_SPREADSHEET_OTTING",
    "Desa-bulucenrana": "ID_SPREADSHEET_BULUCENRANA",
    "Desa-betao": "ID_SPREADSHEET_BETAO",
    "Desa-betris": "ID_SPREADSHEET_BETRIS",
    "Desa-kalempang": "ID_SPREADSHEET_KALEMPANG",
};

const Modal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole') || "";

    const [selectedBulan, setSelectedBulan] = useState("");
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [selectedDesa, setSelectedDesa] = useState(userRole === 'admin' ? "" : userRole);

    // Data Posyandu tetap bisa ditampilkan sebagai label informasi
    const DataFolder = {
        "Desa-dongi": [
            { id: "POS-01", nama: "Data Posyandu Mawar" },
        ],
        "Desa-otting": [
            { id: "POS-01", nama: "Data Posyandu Anggrek" },
        ],
        // ... Tambahkan daftar posyandu desa lain jika perlu
    };

    if (!isOpen) return null;

    const handleDesaChange = (e) => {
        setSelectedDesa(e.target.value);
        setSelectedFolder(null); // Reset folder jika desa ganti
    };

    const handleBulanChange = (e) => {
        setSelectedBulan(e.target.value);
        setSelectedFolder(null);
    };

    const handleKategoriSelect = (kategori) => {
        if (!selectedFolder) {
            alert("Silahkan pilih folder data terlebih dahulu");
            return;
        }

        // 2. Ambil Spreadsheet ID berdasarkan desa yang dipilih
        const spreadsheetId = SPREADSHEET_MAP[selectedDesa];

        if (!spreadsheetId) {
            alert("ID Spreadsheet untuk desa ini belum dikonfigurasi.");
            return;
        }

        // 3. Arahkan ke URL sesuai struktur: /input-data/:desa/:bulan/:spreadsheetId/:kategori
        const urlTujuan = `/input-data/${selectedDesa}/${selectedBulan}/${spreadsheetId}/${kategori}`;

        onClose();
        navigate(urlTujuan);
    };

    const foldersToDisplay = DataFolder[selectedDesa] || [];

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm p-4">
            <div className="relative bg-white rounded-2xl w-full max-w-[550px] max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
                <div className="flex flex-col">
                    {/* Tombol Close */}
                    <div className="flex justify-end mb-2">
                        <button className="text-sky-400 hover:text-sky-600 transition-colors cursor-pointer" onClick={onClose}>
                            <i className="ri-close-circle-fill text-3xl"></i>
                        </button>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-sky-600">Konfigurasi Laporan</h2>
                            <p className="text-gray-500 text-sm">Tentukan periode dan kategori data</p>
                        </div>

                        {/* Dropdown Desa (Hanya muncul jika Login sebagai Admin) */}
                        {userRole === 'admin' && (
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-sky-700 ml-1">Pilih Wilayah Kerja</label>
                                <select
                                    value={selectedDesa}
                                    onChange={handleDesaChange}
                                    className="bg-white border-sky-300 text-sky-800 border-2 cursor-pointer w-full rounded-xl py-2.5 px-4 outline-none focus:border-sky-500 transition-all"
                                >
                                    <option value="">-- Pilih Desa --</option>
                                    <option value="Desa-dongi">Desa Dongi</option>
                                    <option value="Desa-otting">Desa Otting</option>
                                    <option value="Desa-bulucenrana">Desa Bulucenrana</option>
                                    <option value="Desa-betao">Desa Betao</option>
                                    <option value="Desa-betris">Desa Betris</option>
                                    <option value="Desa-kalempang">Desa Kalempang</option>
                                </select>
                            </div>
                        )}

                        {/* Pilihan Bulan */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-sky-700 ml-1">Pilih Periode Bulan</label>
                            <select
                                value={selectedBulan}
                                onChange={handleBulanChange}
                                className="bg-white border-sky-300 text-sky-800 border-2 cursor-pointer w-full rounded-xl py-2.5 px-4 outline-none focus:border-sky-500 transition-all"
                            >
                                <option value="">-- Pilih Bulan --</option>
                                {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>

                        {/* Folder Data / Posyandu */}
                        {selectedBulan && selectedDesa && (
                            <div className="flex flex-col gap-3 animate-in fade-in duration-300">
                                <label className="text-sm font-semibold text-sky-700 ml-1 text-center">Pilih Folder Data / Posyandu</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {foldersToDisplay.length > 0 ? (
                                        foldersToDisplay.map((folder) => (
                                            <button
                                                key={folder.id}
                                                onClick={() => setSelectedFolder(folder)}
                                                className={`flex items-center p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${selectedFolder?.id === folder.id
                                                    ? 'bg-sky-600 border-sky-600 text-white shadow-md'
                                                    : 'bg-white border-sky-100 hover:border-sky-400 text-sky-700'
                                                    }`}
                                            >
                                                <i className={`ri-folder-open-fill mr-3 text-xl ${selectedFolder?.id === folder.id ? 'text-white' : 'text-sky-400'}`}></i>
                                                <span className="font-medium">{folder.nama}</span>
                                            </button>
                                        ))
                                    ) : (
                                        <p className="text-sm text-sky-400 text-center italic">Data posyandu belum tersedia.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Kategori Layanan */}
                        {selectedFolder && (
                            <div className="flex flex-col gap-3 mt-2 animate-in slide-in-from-bottom duration-300">
                                <label className="text-sm font-semibold text-sky-700 text-center">Pilih Kategori Layanan</label>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleKategoriSelect('ibu')}
                                        className="flex-1 flex flex-col items-center justify-center border-2 border-sky-200 text-sky-700 rounded-2xl py-4 gap-2 hover:bg-sky-600 hover:text-white hover:border-sky-600 transition-all cursor-pointer group"
                                    >
                                        <i className="ri-women-fill text-3xl group-hover:scale-110 transition-transform"></i>
                                        <span className="font-bold">Layanan Ibu</span>
                                    </button>
                                    <button
                                        onClick={() => handleKategoriSelect('anak')}
                                        className="flex-1 flex flex-col items-center justify-center border-2 border-sky-200 text-sky-700 rounded-2xl py-4 gap-2 hover:bg-sky-600 hover:text-white hover:border-sky-600 transition-all cursor-pointer group"
                                    >
                                        <i className="ri-emotion-happy-fill text-3xl group-hover:scale-110 transition-transform"></i>
                                        <span className="font-bold">Layanan Anak</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Modal;