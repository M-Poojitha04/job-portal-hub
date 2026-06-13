import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function PostJob() {
    const [formData, setFormData] = useState({
        title: '', description: '', companyName: '', location: '', salaryRange: '', experienceRequired: 0, jobType: 'FULL_TIME'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const token = localStorage.getItem('token');

        try {
            await axios.post('http://localhost:8080/api/v1/jobs', formData, {
                headers: { Authorization: `Bearer ${token}` } // Send JWT token string securely
            });
            navigate('/browse'); // Redirect to search feed upon success
        } catch (err) {
            setError(err.response?.data?.message || 'Unauthorized action. Only recruiters can publish roles.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
                <div className="mb-6">
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Job Posting</h2>
                    <p className="text-slate-500 font-medium mt-1">Publish open opportunities to attract candidate pool matches.</p>
                </div>

                {error && <div className="mb-4 p-3 bg-red-50 text-red-600 font-semibold rounded-xl text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Job Title</label>
                            <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500" placeholder="Software Engineer Intern" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Company Name</label>
                            <input type="text" required value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500" placeholder="TechCorp Solutions" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Location</label>
                            <input type="text" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500" placeholder="Remote / New York" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Salary Range</label>
                            <input type="text" value={formData.salaryRange} onChange={e => setFormData({...formData, salaryRange: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500" placeholder="e.g., $80k - $100k" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Experience (Years)</label>
                            <input type="number" min="0" required value={formData.experienceRequired} onChange={e => setFormData({...formData, experienceRequired: parseInt(e.target.value) || 0})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Job Type</label>
                        <select value={formData.jobType} onChange={e => setFormData({...formData, jobType: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none bg-white focus:border-blue-500">
                            <option value="FULL_TIME">Full Time</option>
                            <option value="PART_TIME">Part Time</option>
                            <option value="REMOTE">Remote</option>
                            <option value="INTERNSHIP">Internship</option>
                            <option value="CONTRACT">Contract</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Job Description</label>
                        <textarea required rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500" placeholder="Outline clear responsibilities, skills requirement, and project details..."></textarea>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 shadow-md">
                        {loading ? 'Publishing Posting...' : 'Publish Job Opportunity'}
                    </button>
                </form>
            </div>
        </div>
    );
}