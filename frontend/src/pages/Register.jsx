import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [formData, setFormData] = useState({
        email: '', password: '', firstName: '', lastName: '', role: 'JOB_SEEKER'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:8080/api/v1/auth/register', formData);
            login(response.data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data || 'An error occurred during account creation.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-black text-blue-600 tracking-tight">Job<span className="text-slate-800">Portal</span></h2>
                    <p className="text-slate-500 mt-1 font-medium">Join us today! Choose your journey below</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Custom Account Type Selection Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-2">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, role: 'JOB_SEEKER' })}
                            className={`py-3 rounded-xl border text-sm font-bold transition flex flex-col items-center justify-center ${formData.role === 'JOB_SEEKER' ? 'border-blue-600 bg-blue-50 text-blue-600 ring-2 ring-blue-100' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            <span>Candidate</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, role: 'RECRUITER' })}
                            className={`py-3 rounded-xl border text-sm font-bold transition flex flex-col items-center justify-center ${formData.role === 'RECRUITER' ? 'border-blue-600 bg-blue-50 text-blue-600 ring-2 ring-blue-100' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            <span>Recruiter</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">First Name</label>
                            <input
                                type="text" required
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Last Name</label>
                            <input
                                type="text" required
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                        <input
                            type="email" required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Secure Password</label>
                        <input
                            type="password" required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition"
                            placeholder="Min. 8 characters"
                        />
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition disabled:opacity-50 mt-2"
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-600 mt-4">
                    Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign In</Link>
                </p>
            </div>
        </div>
    );
}