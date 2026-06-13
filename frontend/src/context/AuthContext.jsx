import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user has a valid saved session on application start
    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedEmail = localStorage.getItem('email');
        const savedRole = localStorage.getItem('role');

        if (savedToken && savedEmail && savedRole) {
            setUser({ token: savedToken, email: savedEmail, role: savedRole });
        }
        setLoading(false);
    }, []);

    const login = (authData) => {
        localStorage.setItem('token', authData.token);
        localStorage.setItem('email', authData.email);
        localStorage.setItem('role', authData.role);
        setUser(authData);
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);