import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedRole = localStorage.getItem('userRole');
        const isLoggedIn = localStorage.getItem('isLoggedIn');

        if (isLoggedIn === 'true' && savedRole) {
            setUser({ role: savedRole });
        }
        setLoading(false);
    }, []);

    const login = (role) => {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', role)
        setUser({ role })
    }

    const logout = () => {
        localStorage.removeItem('isLoggedIn')
        localStorage.removeItem('userRole')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);