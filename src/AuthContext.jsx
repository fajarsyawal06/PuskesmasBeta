import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listener ini akan otomatis terpanggil jika status login berubah (login, logout, atau refresh halaman)
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    // Mengambil role dari Firestore berdasarkan UID
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setUser({
                            uid: currentUser.uid,
                            email: currentUser.email,
                            role: data.role,
                            posyandus: data.posyandus || []
                        });
                    } else {
                        // Jika UID tidak ditemukan di tabel users
                        setUser(null);
                        await auth.signOut();
                    }
                } catch (error) {
                    console.error("Error mengambil data user dari Firestore:", error);
                    setUser(null);
                }
            } else {
                // User belum login
                setUser(null);
            }
            // Selesai memuat
            setLoading(false);
        });

        // Membersihkan listener ketika komponen di-unmount
        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);