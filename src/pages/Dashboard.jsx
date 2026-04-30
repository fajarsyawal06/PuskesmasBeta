import Modal from "../components/Modal"
import { useState } from "react"
import { useAuth } from "../AuthContext"

export default function Dashboard() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { user } = useAuth();

    const formatName = (role) => {
        if (!role) return "";
        return role.replace("Desa-", "").replace("-", " ");
    };

    return (
        <div>
            <div className="w-full min-h-100 bg-gray-50 pt-10 md:pt-10 pb-10">
                <div className="judul px-6 md:px-10 mb-8 md:mb-12">
                    <h1 className="text-2xl md:text-4xl text-sky-600 leading-snug">Selamat Datang di <br className="md:hidden" /><span className="font-bold">Sistem Informasi Puskesmas</span></h1>
                    {user?.role === 'admin' ? (
                        <p className="mt-2 text-gray-600 text-sm md:text-base">Sekarang Anda berada pada <span className="font-bold text-sky-700">halaman admin</span></p>
                    ) : (
                        <p className="mt-2 text-gray-600 text-sm md:text-base">Sekarang Anda berada pada desa <span className="capitalize font-bold text-sky-700">{formatName(user?.role)}</span></p>
                    )}
                </div>
                <div className="folder px-6 md:px-10">
                    <button onClick={() => setIsModalOpen(true)} className="border-2 border-sky-300 hover:border-sky-500 rounded-2xl overflow-hidden border-dashed w-full cursor-pointer transition-colors group">
                        <div className="bg-sky-50 group-hover:bg-sky-100 transition-colors flex flex-col h-80 md:h-140 justify-center items-center p-4">
                            <i className="ri-folder-open-line text-6xl md:text-7xl text-sky-400 group-hover:text-sky-600 group-hover:scale-110 transition-transform mb-2"></i>
                            <p className="text-sky-700 font-bold text-sm md:text-lg">Buka Informasi {user?.role === 'admin' ? 'Rekapitulasi' : 'Desa'}</p>
                        </div>
                    </button>
                </div>
            </div>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div >
    )
}
