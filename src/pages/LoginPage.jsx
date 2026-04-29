import { useState } from "react"
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [role, setRole] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    // Objek berisi daftar password untuk masing-masing role
    // Karena ini di sisi client (React), password bisa terlihat jika di-inspect
    const validPasswords = {
        "admin": "admin123",
        "Desa-dongi": "1111",
        "Desa-otting": "otting123",
        "Desa-bulucenrana": "bulu123",
        "Desa-betao": "betao123",
        "Desa-betris": "betris123",
        "Desa-kalempang": "kalempang123"
    };

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (role === "") {
            alert("Pilih Desa terlebih dahulu")
            return
        }

        if (password === "") {
            alert("Masukkan Password")
            return
        }


        setIsLoading(true)

        // Simulasi delay loading agar terlihat seperti proses login sungguhan (opsional)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Logika Pengecekan Langsung
        if (validPasswords[role] === password) {
            login(role);
            navigate("/");
        } else {
            alert("Password salah. Silakan coba lagi.")
        }

        setIsLoading(false)
    }

    return (
        <div className="flex items-center justify-center h-screen w-screen bg-sky-200">
            <div className="flex flex-col items-center bg-white rounded-xl p-12 shadow-lg">
                <h1 className="text-3xl font-bold text-sky-600 mb-2">Login</h1>
                <p className="text-xl text-gray-500 mb-6">Sistem Informasi Puskesmas</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <select value={role} onChange={(e) => setRole(e.target.value)} required className="p-2 border border-sky-600 rounded-xl w-80 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white" name="role" id="role">
                        <option value="" disabled>-- Pilih Desa --</option>
                        <option value="admin">Admin</option>
                        <option value="Desa-dongi">Desa Dongi</option>
                        <option value="Desa-otting">Desa Otting</option>
                        <option value="Desa-bulucenrana">Desa Bulucenrana</option>
                        <option value="Desa-betao">Desa Betao</option>
                        <option value="Desa-betris">Desa Betris</option>
                        <option value="Desa-kalempang">Desa Kalempang</option>
                    </select>

                    <input value={password} onChange={(e) => setPassword(e.target.value)} className="p-2 border border-sky-600 rounded-xl w-80 focus:outline-none focus:ring-2 focus:ring-sky-400" type="password" placeholder="Password" />

                    <button className={`p-2 border border-transparent rounded-xl w-80 text-white font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 ${isLoading ? 'bg-sky-400 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'}`} type="submit" disabled={isLoading}>
                        {isLoading ? "Memeriksa..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    )
}