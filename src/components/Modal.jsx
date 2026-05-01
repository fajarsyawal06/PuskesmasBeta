import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../AuthContext';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../firebase';
import { showErrorAlert, showWarningAlert } from '../utils/alertUtils';
const Modal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const userRole = user?.role || "";

    const [selectedBulan, setSelectedBulan] = useState("");
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [selectedDesa, setSelectedDesa] = useState(userRole === 'admin' ? "" : userRole);

    const [foldersToDisplay, setFoldersToDisplay] = useState([]);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [adminRekapIds, setAdminRekapIds] = useState({ ibu: "", anak: "" });

    useEffect(() => {
        if (userRole !== 'admin') {
            // Untuk petugas desa biasa, tambahkan data desanya ke masing-masing folder
            const posyandusWithDesa = (user?.posyandus || []).map(p => ({ ...p, desa: userRole }));
            setFoldersToDisplay(posyandusWithDesa);
            return;
        }

        // Jika user adalah admin, ambil SEMUA posyandu dari seluruh desa di Firestore
        const fetchAllPosyandus = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "users"));
                let loadedFolders = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.role === 'admin') {
                        setAdminRekapIds({ ibu: data.rekapIbuId || "", anak: data.rekapAnakId || "" });
                    } else if (data.posyandus) {
                        // Tempelkan asal desa ke setiap posyandu agar URL routing nantinya benar
                        const posyandusWithDesa = data.posyandus.map(p => ({ ...p, desa: data.role }));
                        loadedFolders = [...loadedFolders, ...posyandusWithDesa];
                    }
                });
                setFoldersToDisplay(loadedFolders);
            } catch (error) {
                console.error("Gagal mengambil semua data posyandu:", error);
            }
        };
        fetchAllPosyandus();
    }, [user, userRole]);

    if (!isOpen) return null;

    const handleBulanChange = (e) => {
        setSelectedBulan(e.target.value);
        setSelectedFolder(null);
    };

    const handleKategoriSelect = async (kategori) => {
        if (userRole === 'admin') {
            if (!selectedBulan) {
                showWarningAlert('Pilih Bulan', 'Silakan pilih periode bulan terlebih dahulu');
                return;
            }

            const spreadsheetId = kategori === 'ibu' ? adminRekapIds.ibu : adminRekapIds.anak;
            if (!spreadsheetId) {
                showErrorAlert('ID Tidak Ditemukan', `ID Spreadsheet Rekapitulasi ${kategori.toUpperCase()} belum diatur di Firestore.`);
                return;
            }
            
            setIsRedirecting(true);
            try {
                const response = await fetch(`/api/get-rekap-url?kategori=${kategori}&bulan=${selectedBulan}&spreadsheetId=${spreadsheetId}`);
                const result = await response.json();
                
                if (response.ok && result.success) {
                    window.open(result.url, '_blank');
                    onClose();
                } else {
                    showErrorAlert('Gagal Membuka', "Gagal membuka spreadsheet: " + (result.error || "Terjadi kesalahan"));
                }
            } catch (error) {
                showErrorAlert('Error Sistem', "Terjadi kesalahan sistem: " + error.message);
            } finally {
                setIsRedirecting(false);
            }
            return;
        }

        if (!selectedFolder) {
            showWarningAlert('Pilih Folder', 'Silakan pilih folder data terlebih dahulu');
            return;
        }

        // Ambil Spreadsheet ID langsung dari folder/posyandu yang sedang diklik
        const spreadsheetId = selectedFolder.spreadsheetId;

        if (!spreadsheetId) {
            showErrorAlert('Konfigurasi Belum Selesai', 'ID Spreadsheet untuk Posyandu ini belum dikonfigurasi.');
            return;
        }

        // Arahkan ke URL sesuai struktur menggunakan properti desa yang sudah menempel di objek folder
        const urlTujuan = `/input-data/${selectedFolder.desa}/${selectedBulan}/${spreadsheetId}/${kategori}`;

        onClose();
        navigate(urlTujuan);
    };

    // foldersToDisplay dikelola oleh useEffect di atas

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

                        {/* Folder Data / Posyandu (Hanya untuk Non-Admin) */}
                        {selectedBulan && userRole !== 'admin' && (
                            <div className="flex flex-col gap-3 animate-in fade-in duration-300">
                                <label className="text-sm font-semibold text-sky-700 ml-1 text-center">Pilih Folder Data / Posyandu</label>
                                <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                                    {foldersToDisplay.length > 0 ? (
                                        foldersToDisplay.map((folder, idx) => (
                                            <button
                                                key={folder.id || idx}
                                                onClick={() => setSelectedFolder(folder)}
                                                className={`flex flex-col p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${selectedFolder?.id === folder.id && selectedFolder?.desa === folder.desa
                                                    ? 'bg-sky-600 border-sky-600 text-white shadow-md'
                                                    : 'bg-white border-sky-100 hover:border-sky-400 text-sky-700'
                                                    }`}
                                            >
                                                <div className="flex items-center">
                                                    <i className={`ri-folder-open-fill mr-3 text-xl ${selectedFolder?.id === folder.id && selectedFolder?.desa === folder.desa ? 'text-white' : 'text-sky-400'}`}></i>
                                                    <span className="font-medium">{folder.nama}</span>
                                                </div>
                                                {/* Tampilkan asal desa jika login sebagai admin agar lebih jelas */}
                                                {userRole === 'admin' && folder.desa && (
                                                    <span className={`text-xs ml-8 mt-1 ${selectedFolder?.id === folder.id && selectedFolder?.desa === folder.desa ? 'text-sky-200' : 'text-gray-400'}`}>
                                                        {folder.desa.replace('Desa-', 'Desa ').toUpperCase()}
                                                    </span>
                                                )}
                                            </button>
                                        ))
                                    ) : (
                                        <p className="text-sm text-sky-400 text-center italic">Data posyandu belum tersedia.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Kategori Layanan */}
                        {(selectedFolder || (userRole === 'admin' && selectedBulan)) && (
                            <div className="flex flex-col gap-3 mt-2 animate-in slide-in-from-bottom duration-300 relative">
                                {isRedirecting && (
                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-2xl">
                                        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                        <p className="text-sky-700 font-bold animate-pulse">Mengalihkan ke Spreadsheet...</p>
                                    </div>
                                )}
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