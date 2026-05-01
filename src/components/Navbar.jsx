import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../AuthContext';
import { updatePassword } from "firebase/auth";
import { auth } from '../firebase';
import { showSuccessAlert } from '../utils/alertUtils';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState("");

    const formatName = (role) => {
        if (!role) return "";
        return role.replace("-", " ");
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError("");

        if (newPassword.length < 6) {
            setError("Password harus minimal 6 karakter");
            return;
        }

        setIsUpdating(true);
        try {
            if (auth.currentUser) {
                await updatePassword(auth.currentUser, newPassword);
                showSuccessAlert('Berhasil', 'Password berhasil diubah. Silakan login kembali dengan password baru.');
                setIsPasswordModalOpen(false);
                setNewPassword("");

                // Paksa logout setelah ganti password demi keamanan
                await logout();
                navigate("/login");
            } else {
                setError("Sesi tidak ditemukan.");
            }
        } catch (error) {
            console.error("Change Password Error:", error);
            if (error.code === 'auth/requires-recent-login') {
                setError("Sesi Anda sudah terlalu lama. Silakan logout dan login kembali terlebih dahulu.");
            } else {
                setError("Gagal mengganti password: " + error.message);
            }
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <nav>
            <div className="fixed w-full top-0 z-40 flex justify-between items-center bg-white px-4 md:px-8 py-3 md:py-6 shadow-md" >
                <div className="logo flex items-center gap-4">
                    <i className="ri-hospital-line text-sky-600 text-2xl md:text-3xl"></i>
                    <div className="flex flex-col justify-center">
                        <h1 className="text-sky-600 text-md md:text-xl font-bold">SIPUS</h1>
                        <p className="text-sky-600 text-[6px] md:text-sm font-normal">Sistem Informasi Puskesmas</p>
                    </div>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                        className="flex items-center gap-2 md:gap-3 focus:outline-none cursor-pointer p-1 md:p-2 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                        <div className="text-right flex flex-col justify-center">
                            <p className="text-sky-700 font-bold capitalize leading-tight text-sm md:text-base">{formatName(user?.role)}</p>
                            <p className="text-[8px] md:text-xs text-gray-500 truncate max-w-[100px] md:max-w-[200px]">{user?.email}</p>
                        </div>
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 border border-sky-200">
                            <i className="ri-user-3-fill text-lg md:text-xl"></i>
                        </div>
                        <i className={`ri-arrow-down-s-line text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 py-2 z-50 origin-top-right">
                            <button
                                onMouseDown={() => setIsPasswordModalOpen(true)}
                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 transition-colors flex items-center gap-3 cursor-pointer"
                            >
                                <i className="ri-key-2-line text-lg"></i>
                                Ganti Sandi
                            </button>
                            <div className="h-px bg-gray-100 my-1"></div>
                            <button
                                onMouseDown={handleLogout}
                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-3 cursor-pointer"
                            >
                                <i className="ri-logout-box-r-line text-lg"></i>
                                Keluar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Ganti Password */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-xl relative">
                        <button
                            onClick={() => {
                                setIsPasswordModalOpen(false);
                                setError("");
                                setNewPassword("");
                            }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                            <i className="ri-close-line text-2xl"></i>
                        </button>

                        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Ganti Password</h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-xl text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-600 ml-1 block mb-1">Password Baru</label>
                                <div className="relative">
                                    <i className="ri-lock-password-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Minimal 6 karakter"
                                        className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-2 pl-10 pr-12 outline-none focus:border-sky-500 transition-colors"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                                    >
                                        <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"}></i>
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isUpdating}
                                className={`w-full py-3 rounded-xl font-bold text-white transition-all cursor-pointer ${isUpdating ? 'bg-sky-400 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'
                                    }`}
                            >
                                {isUpdating ? (
                                    <span><i className="ri-loader-4-line animate-spin mr-2"></i>Menyimpan...</span>
                                ) : (
                                    "Simpan Password Baru"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </nav>
    );
}