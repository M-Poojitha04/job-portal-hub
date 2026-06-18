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
        const savedAvatar = localStorage.getItem('profilePicUrl'); // UPDATED: Session tracker

        if (savedToken && savedEmail && savedRole) {
            setUser({
                token: savedToken,
                email: savedEmail,
                role: savedRole,
                profilePicUrl: savedAvatar || '' // UPDATED: State property fallback binding
            });
        }
        setLoading(false);
    }, []);

    const login = (authData) => {
        localStorage.setItem('token', authData.token);
        localStorage.setItem('email', authData.email);
        localStorage.setItem('role', authData.role);
        if (authData.profilePicUrl) {
            localStorage.setItem('profilePicUrl', authData.profilePicUrl);
        }
        setUser(authData);
    };

    const logout = () => {
        localStorage.clear(); // Wipes token, email, role, and avatar allocations simultaneously
        setUser(null);        // Triggers downstream reactive re-render sweeps
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);