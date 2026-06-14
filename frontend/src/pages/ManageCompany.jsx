import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ManageCompany() {
    const [company, setCompany] = useState({
        companyName: '',
        description: '',
        logoUrl: '',
        website: '',
        socialLinks: ''
    });

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCompanyDetails();
    }, []);

    const fetchCompanyDetails = () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        import('axios').then((rawAxios) => {
            rawAxios.default.get('http://localhost:8080/api/v1/companies/my-company', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    if (res.data) {
                        setCompany({
                            companyName: res.data.companyName || '',
                            description: res.data.description || '',
                            logoUrl: res.data.logoUrl || '',
                            website: res.data.website || '',
                            socialLinks: res.data.socialLinks || ''
                        });
                    }
                    setLoading(false);
                })
                .catch(() => {
                    setError('Failed to pull corporate workspace credentials.');
                    setLoading(false);
                });
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setSaving(true);
        const token = localStorage.getItem('token');

        try {
            const rawAxios = (await import('axios')).default;
            await rawAxios.default.put('http://localhost:8080/api/v1/companies/update', company, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('✓ Corporate profile configuration synchronized securely!');
        } catch {
            setError('An error occurred while saving organization profile entries.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center py-20 font-medium text-slate-600">Loading your corporate workspace profile...</div>;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">

                <div className="mb-6 flex items-center gap-4">
                    <Link to="/dashboard" className="text-sm font-bold text-blue-600 hover:underline">← Back to Dashboard</Link>
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Company Profile</h1>
                    <p className="text-slate-500 font-medium mt-1">Configure the branding metadata appended automatically to your active listings.</p>
                </div>

                {message && <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold rounded-xl mb-6">{message}</div>}
                {error && <div className="p-4 bg-red-50 border border-red-200 text-red-600 font-semibold rounded-xl mb-6">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5 text-sm font-bold text-slate-700">

                    <div>
                        <label className="block mb-1.5">Official Company Name</label>
                        <input
                            type="text"
                            required
                            value={company.companyName}
                            onChange={e => setCompany({...company, companyName: e.target.value})}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                            placeholder="e.g., Tech Solutions Inc."
                        />
                    </div>

                    <div>
                        <label className="block mb-1.5">Corporate Logo Image URL</label>
                        <input
                            type="text"
                            value={company.logoUrl}
                            onChange={e => setCompany({...company, logoUrl: e.target.value})}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium font-mono text-xs"
                            placeholder="https://example.com/logos/techcorp.png"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1.5">Corporate Website</label>
                            <input
                                type="url"
                                value={company.website}
                                onChange={e => setCompany({...company, website: e.target.value})}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                                placeholder="https://company.com"
                            />
                        </div>
                        <div>
                            <label className="block mb-1.5">LinkedIn Profile / Social Handler</label>
                            <input
                                type="text"
                                value={company.socialLinks}
                                onChange={e => setCompany({...company, socialLinks: e.target.value})}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                                placeholder="https://linkedin.com/company/example"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-1.5">About / Company Description</label>
                        <textarea
                            rows={5}
                            value={company.description}
                            onChange={e => setCompany({...company, description: e.target.value})}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium resize-none"
                            placeholder="Provide a detailed overview of your business domain, workspace culture, and industry goals..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-md shadow-blue-100 disabled:opacity-50"
                    >
                        {saving ? 'Synchronizing Data Lines...' : 'Save Corporate Configuration'}
                    </button>
                </form>

            </div>
        </div>
    );
}