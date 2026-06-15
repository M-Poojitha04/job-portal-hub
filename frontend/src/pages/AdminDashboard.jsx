import { useState, useEffect } from 'react';

export default function AdminDashboard() {
    const [summary, setSummary] = useState({ totalUsers: 0, totalJobs: 0, totalApplications: 0, unverifiedCompanies: 0 });
    const [users, setUsers] = useState([]);
    const [pendingCompanies, setPendingCompanies] = useState([]);
    const [activeTab, setActiveTab] = useState('metrics');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminPlatformData();
    }, []);

    const fetchAdminPlatformData = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const rawAxios = (await import('axios')).default;

            const [summaryRes, usersRes, companiesRes] = await Promise.all([
                rawAxios.get('http://localhost:8080/api/v1/admin/summary', { headers: { Authorization: `Bearer ${token}` } }),
                rawAxios.get('http://localhost:8080/api/v1/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
                rawAxios.get('http://localhost:8080/api/v1/admin/companies/pending', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            setSummary(summaryRes.data);
            setUsers(usersRes.data);
            setPendingCompanies(companiesRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Admin credentials verification error context:", err);
            setLoading(false);
        }
    };

    const handleToggleUserStatus = async (userId) => {
        const token = localStorage.getItem('token');
        try {
            const rawAxios = (await import('axios')).default;
            const res = await rawAxios.post(`http://localhost:8080/api/v1/admin/users/${userId}/toggle-status`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(res.data.message);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, active: res.data.isActive } : u));
        } catch {
            alert("Could not update target user status properties flag.");
        }
    };

    const handleVerifyCompany = async (companyId, approve) => {
        const token = localStorage.getItem('token');
        try {
            const rawAxios = (await import('axios')).default;
            const res = await rawAxios.post(`http://localhost:8080/api/v1/admin/companies/${companyId}/verify?approve=${approve}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(res.data.message);
            setPendingCompanies(prev => prev.filter(c => c.id !== companyId));
            setSummary(prev => ({ ...prev, unverifiedCompanies: Math.max(0, prev.unverifiedCompanies - 1) }));
        } catch {
            alert("Verification operation failed.");
        }
    };

    if (loading) return <div className="text-center py-20 font-medium text-slate-600">Loading system admin logs workspace...</div>;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">

                <div className="mb-8">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">System Administration</h1>
                    <p className="text-slate-500 font-medium mt-1">Platform operations master panel to configure system settings variables.</p>
                </div>

                {/* Tab Controls Bar */}
                <div className="flex border-b border-slate-200 mb-6 gap-6 text-sm font-bold">
                    <button onClick={() => setActiveTab('metrics')} className={`pb-3 ${activeTab === 'metrics' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Metrics Overview</button>
                    <button onClick={() => setActiveTab('users')} className={`pb-3 ${activeTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Accounts Management ({users.length})</button>
                    <button onClick={() => setActiveTab('companies')} className={`pb-3 ${activeTab === 'companies' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Pending Approvals ({pendingCompanies.length})</button>
                </div>

                {/* TAB CONTENT 1: ANALYTICS GRID CORES */}
                {activeTab === 'metrics' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <span className="text-xs font-bold text-slate-400 uppercase">Platform Users</span>
                            <p className="text-3xl font-black text-slate-800 mt-1">{summary.totalUsers}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <span className="text-xs font-bold text-slate-400 uppercase">Positions Published</span>
                            <p className="text-3xl font-black text-slate-800 mt-1">{summary.totalJobs}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <span className="text-xs font-bold text-slate-400 uppercase">Applications Filed</span>
                            <p className="text-3xl font-black text-slate-800 mt-1">{summary.totalApplications}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <span className="text-xs font-bold text-amber-500 uppercase">Pending Verification</span>
                            <p className="text-3xl font-black text-amber-600 mt-1">{summary.unverifiedCompanies}</p>
                        </div>
                    </div>
                )}

                {/* TAB CONTENT 2: ACCOUNTS MODERATION LOG LISTING */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
                        <table className="w-full text-left text-sm font-semibold">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase">
                            <tr>
                                <th className="p-4">Account Email</th>
                                <th className="p-4">Access Role</th>
                                <th className="p-4 text-center">System State</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50/50">
                                    <td className="p-4 font-bold text-slate-900">{u.email}</td>
                                    <td className="p-4"><span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono font-bold">{u.role}</span></td>
                                    <td className="p-4 text-center">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${u.active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                {u.active ? 'ACTIVE' : 'BLOCKED'}
                                            </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => handleToggleUserStatus(u.id)}
                                            className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${u.active ? 'bg-red-50 hover:bg-red-100 text-red-600' : 'bg-green-50 hover:bg-green-100 text-green-600'}`}
                                        >
                                            {u.active ? 'Block Account' : 'Activate Account'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* TAB CONTENT 3: CORPORATE VERIFICATION PIPELINE BOARD */}
                {activeTab === 'companies' && (
                    <div className="space-y-4 animate-fadeIn">
                        {pendingCompanies.length === 0 ? (
                            <div className="bg-white text-center p-12 rounded-2xl border border-slate-200 text-slate-400 font-medium shadow-sm">
                                No corporate profiles are awaiting administrative verification right now.
                            </div>
                        ) : (
                            pendingCompanies.map(c => (
                                <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">{c.companyName}</h3>
                                        <p className="text-xs font-semibold text-blue-600 mt-0.5">🌐 {c.website || 'No Website linked'}</p>
                                        <p className="text-xs text-slate-500 font-medium mt-2 max-w-xl">{c.description || 'No corporate profile summary text entered.'}</p>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                                        <button onClick={() => handleVerifyCompany(c.id, false)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition">Reject</button>
                                        <button onClick={() => handleVerifyCompany(c.id, true)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm">Approve & Verify</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}