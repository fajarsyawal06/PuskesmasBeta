import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// PASTIKAN PATH IMPORT INI SESUAI DENGAN LOKASI FILE firebase.js KAMU
import { auth, db } from '../firebase';
import { useAuth } from '../AuthContext';

export default function Login() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Jika user sudah terisi (berhasil login & role diambil), otomatis arahkan ke dashboard
        if (user) {
            navigate("/");
        }
    }, [user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault(); // Mencegah halaman refresh saat tombol ditekan
        setError('');
        setIsLoading(true);

        try {
            // Verifikasi Email dan Password ke Firebase Auth
            await signInWithEmailAndPassword(auth, email, password);

            // Selesai. AuthContext akan otomatis mendeteksi login, mengambil role, dan mengisi `user`.
            // Setelah itu, useEffect di atas akan otomatis mengarahkan ke halaman utama.
            // (Kita biarkan tombol tetap 'Memproses...' sampai terjadi redirect)
        } catch (err) {
            console.error("Login Error:", err);
            // Menangkap pesan error dari Firebase jika salah password/email
            setError("Login gagal. Periksa kembali email dan password Anda.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-3xl shadow-xl overflow-hidden">
                {/* Bagian Header Biru */}
                <div className="bg-sky-600 px-8 py-10 text-center text-white">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <i className="ri-hospital-line text-4xl"></i>
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold">SIPUS</h1>
                    <p className="text-sky-100 text-md font-bold mb-2">Sistem Informasi Puskesmas</p>
                    <p className="text-sky-100 text-sm">Puskesmas Dongi - Kab. Sidenreng Rappang</p>
                </div>

                {/* Bagian Form */}
                <div className="p-8">

                    {/* Pesan Error */}
                    {error && (
                        <div className="mb-6 p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded-xl text-center flex items-center justify-center gap-2">
                            <i className="ri-error-warning-fill"></i> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="flex flex-col gap-5">
                        <div>
                            <label className="text-sm font-semibold text-gray-600 ml-1 block mb-1">Email</label>
                            <div className="relative">
                                <i className="ri-mail-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Masukkan email Anda"
                                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-sky-500 transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-600 ml-1 block mb-1">Password</label>
                            <div className="relative">
                                <i className="ri-lock-password-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Masukkan password"
                                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-3 pl-11 pr-12 outline-none focus:border-sky-500 transition-colors"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                                >
                                    <i className={showPassword ? "ri-eye-off-line text-lg" : "ri-eye-line text-lg"}></i>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full mt-2 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all cursor-pointer ${isLoading ? 'bg-sky-400 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700 hover:-translate-y-0.5'
                                }`}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <i className="ri-loader-4-line animate-spin"></i> Memproses...
                                </span>
                            ) : "Masuk ke Sistem"}
                        </button>
                    </form>

                    <p className="text-center text-xs text-gray-400 mt-8">
                        Hanya untuk penggunaan internal petugas kesehatan.
                    </p>
                </div>
            </div>
        </div>
    );
}