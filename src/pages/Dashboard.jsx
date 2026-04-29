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
            <div className="w-full min-h-200 bg-white">
                <div className="judul p-10">
                    <h1 className="text-4xl text-sky-600">Selamat Datang di <span className="font-bold">Sistem Informasi Puskesmas</span></h1>
                    <p>Sekarang anda berada pada desa <span className="capitalize">{formatName(user?.role)}</span> </p>
                </div>
                <div className="folder p-5">
                    <button onClick={() => setIsModalOpen(true)} className="border border-gray-500 rounded-xl overflow-hidden border-dashed w-full cursor-pointer">
                        <div className="bg-gray-100 flex flex-col h-150 justify-center items-center p-2 ">
                            <i className="ri-folder-open-line text-6xl text-gray-400"></i>
                            <p className="text-gray-400 font-medium">Informasi Desa</p>
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
