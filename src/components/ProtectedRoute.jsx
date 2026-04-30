import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        // Mencegah layar berkedip ke halaman Login saat memverifikasi sesi
        return (
            <div className="min-h-screen flex items-center justify-center bg-sky-50">
                <div className="flex flex-col items-center gap-3">
                    <i className="ri-loader-4-line animate-spin text-4xl text-sky-600"></i>
                    <p className="text-sky-800 font-medium">Memverifikasi Sesi...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return children;
}

export default ProtectedRoute;