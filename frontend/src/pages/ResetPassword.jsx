import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const rawAxios = (await import('axios')).default;
            const res = await rawAxios.post('http://localhost:8080/api/v1/auth/reset-password', {
                token,
                newPassword
            });
            setMessage(res.data.message);
            setTimeout(() => navigate('/login'), 3000); // Redirect to login page upon success
        } catch (err) {
            setError(err.response?.data || "Failed to update your credentials pipeline matrix.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
                <div className="mb-6">
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reset Password</h2>
                    <p className="text-slate-500 font-medium mt-1">Provide a new secure passphrase profile credentials set.</p>
                </div>

                {message && <div className="p-4 bg-emerald-50 text-emerald-700 font-semibold rounded-xl text-sm border border-emerald-200 mb-4">{message}</div>}
                {error && <div className="p-4 bg-red-50 text-red-600 font-semibold rounded-xl text-sm border border-red-200 mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4 text-sm font-bold text-slate-700">
                    <div>
                        <label className="block mb-1.5">New Secure Password</label>
                        <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-md disabled:opacity-50">
                        {loading ? 'Overwriting Hash Data...' : 'Confirm New Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}