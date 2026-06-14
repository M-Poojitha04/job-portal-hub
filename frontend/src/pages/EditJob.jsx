import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from 'axios';

export default function EditJob() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        title: '',
        companyName: '',
        description: '',
        location: 'Remote',
        salaryRange: '',
        experienceRequired: 0,
        jobType: 'FULL_TIME'
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        // Fetch the current job details to pre-populate the form inputs
        axiosInstance.get(`http://localhost:8080/api/v1/jobs`)
            .then(res => {
                const jobToEdit = res.data.find(j => j.id === LongParse(jobId));
                if (jobToEdit) {
                    setForm({
                        title: jobToEdit.title,
                        companyName: jobToEdit.companyName,
                        description: jobToEdit.description,
                        location: jobToEdit.location,
                        salaryRange: jobToEdit.salaryRange || '',
                        experienceRequired: jobToEdit.experienceRequired,
                        jobType: jobToEdit.jobType
                    });
                } else {
                    setError('Job posting not found.');
                }
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to fetch job specifications.');
                setLoading(false);
            });
    }, [jobId]);

    // Helper to handle safe ID matching
    const LongParse = (id) => parseInt(id, 10);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        const token = localStorage.getItem('token');

        try {
            await axiosInstance.put(`http://localhost:8080/api/v1/jobs/${jobId}`, form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/dashboard'); // Head straight back to the dashboard on success
        } catch (err) {
            setError(err.response?.data || 'Failed to update job details.');
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-20 font-medium text-slate-600">Loading job specifications...</div>;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div className="mb-6">
                    <Link to="/dashboard" className="text-sm font-bold text-blue-600 hover:underline">← Cancel & Back</Link>
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Edit Position Specifications</h1>
                    <p className="text-slate-500 font-medium mt-1">Modify the active parameters for your corporate listing.</p>
                </div>

                {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6 font-semibold">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5 text-sm font-bold text-slate-700">
                    <div>
                        <label className="block mb-1.5">Job Title</label>
                        <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium" required />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1.5">Workplace Type</label>
                            <select value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-sm font-semibold text-slate-700 outline-none focus:border-blue-500">
                                <option value="Remote">Remote</option>
                                <option value="Hybrid">Hybrid</option>
                                <option value="Onsite">On-site</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1.5">Commitment Type</label>
                            <select value={form.jobType} onChange={e => setForm({...form, jobType: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-sm font-semibold text-slate-700 outline-none focus:border-blue-500">
                                <option value="FULL_TIME">Full Time</option>
                                <option value="PART_TIME">Part Time</option>
                                <option value="CONTRACT">Contract</option>
                                <option value="INTERNSHIP">Internship</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1.5">Salary Range (e.g. $80k - $100k)</label>
                            <input type="text" value={form.salaryRange} onChange={e => setForm({...form, salaryRange: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium" placeholder="Optional" />
                        </div>
                        <div>
                            <label className="block mb-1.5">Minimum Experience (Years)</label>
                            <input type="number" value={form.experienceRequired} onChange={e => setForm({...form, experienceRequired: parseInt(e.target.value) || 0})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium" min="0" required />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-1.5">Detailed Job Description</label>
                        <textarea rows="5" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium" required />
                    </div>

                    <button type="submit" disabled={submitting} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-md disabled:opacity-50">
                        {submitting ? 'Saving Changes...' : 'Publish Modifications'}
                    </button>
                </form>
            </div>
        </div>
    );
}