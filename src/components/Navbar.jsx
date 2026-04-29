import { useNavigate } from "react-router-dom"
import { useAuth } from "../AuthContext"

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const formatName = (role) => {
        if (!role) return "";
        return role.replace("-", " ");
    };

    const handleLogout = () => {
        logout();
        navigate("/login")
    }
    return (
        <nav>
            <div className="fixed w-full top-0 flex justify-between items-center bg-white px-8 py-6 shadow-lg" >
                <div className="logo flex items-center gap-2">
                    <i className="ri-hospital-line text-sky-600 text-3xl"></i>
                    <h1 className="text-sky-600 text-xl font-normal">Puskesmas</h1>
                </div>
                <div className="role">
                    <p className="text-sky-600 text-2xl font-medium capitalize">{formatName(user?.role)}</p>
                </div>
                <div className="profile flex items-center gap-2">
                    <button onClick={handleLogout} className="p-2 border border-transparent rounded-xl w-40 cursor-pointer text-white font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 bg-sky-600 hover:bg-sky-700">
                        Logout
                    </button>
                </div>
            </div>

        </nav>
    )
}