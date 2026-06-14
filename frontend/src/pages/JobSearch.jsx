import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function JobSearch() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [appliedJobIds, setAppliedJobIds] = useState(new Set());
    const [submittingId, setSubmittingId] = useState(null);

    // --- Filter States ---
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('ALL');
    const [selectedType, setSelectedType] = useState('ALL');

    const { user } = useAuth();

    useEffect(() => {
        axios.get('http://localhost:8080/api/v1/jobs')
            .then(response => {
                setJobs(response.data);
                setLoading(false);
            })
            .catch(err => {
                setError('Failed to fetch job postings. Please try again later.');
                setLoading(false);
            });
    }, []);

    const handleApply = async (jobId) => {
        if (!user) {
            setError('Please sign in as a Candidate to apply for positions.');
            return;
        }
        if (user.role !== 'JOB_SEEKER') {
            setError('Only Candidate accounts can submit job applications.');
            return;
        }

        setSubmittingId(jobId);
        setError('');
        const token = localStorage.getItem('token');

        try {
            await axios.post(`http://localhost:8080/api/v1/applications/apply/${jobId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppliedJobIds(prev => new Set(prev).add(jobId));
        } catch (err) {
            setError(err.response?.data || 'An error occurred while submitting your application.');
        } finally {
            setSubmittingId(null);
        }
    };

// --- Dynamic Live Filter Logic (Fixed with .includes) ---
    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.companyName.toLowerCase().includes(searchQuery.toLowerCase());

        // Use .includes() and strip hyphens/spaces to prevent "Onsite" vs "On-site" mismatches
        const cleanJobLocation = job.location.toLowerCase().replace('-', '');
        const cleanSelectedLocation = selectedLocation.toLowerCase().replace('-', '');

        const matchesLocation = selectedLocation === 'ALL' ||
            cleanJobLocation.includes(cleanSelectedLocation);

        const matchesType = selectedType === 'ALL' || job.jobType === selectedType;

        return matchesSearch && matchesLocation && matchesType;
    });

    if (loading) return <div className="text-center py-20 font-medium text-slate-600">Loading active opportunities...</div>;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="mb-8 text-center md:text-left">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Explore Opportunities</h1>
                    <p className="text-slate-500 mt-2 font-medium">Discover your next career milestone backed by relational database tracking.</p>
                </div>

                {/* --- Search & Filter Panel (Ensure controlled inputs) --- */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Search Keywords</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery} // Maps directly to state
                                onChange={(e) => setSearchQuery(e.target.value)} // Forces re-render on every single keystroke
                                placeholder="Search by job title or company name..."
                                className="w-full pl-4 pr-10 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium text-sm text-slate-800"
                            />
                            <span className="absolute right-3.5 top-3 text-slate-400">🔍</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Workplace Type</label>
                        <select
                            value={selectedLocation} // Maps directly to state
                            onChange={(e) => setSelectedLocation(e.target.value)} // Forces re-render on change
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
                        >
                            <option value="ALL">All Locations</option>
                            <option value="Remote">Remote</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="Onsite">On-site</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Commitment</label>
                        <select
                            value={selectedType} // Maps directly to state
                            onChange={(e) => setSelectedType(e.target.value)} // Forces re-render on change
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
                        >
                            <option value="ALL">All Job Types</option>
                            <option value="FULL_TIME">Full Time</option>
                            <option value="PART_TIME">Part Time</option>
                            <option value="CONTRACT">Contract</option>
                            <option value="INTERNSHIP">Internship</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl mb-6 font-semibold shadow-sm">
                        {error}
                    </div>
                )}

                {/* Job Listings Feed */}
                {filteredJobs.length === 0 ? (
                    <div className="bg-white text-center p-12 rounded-2xl border border-slate-200 text-slate-500 font-medium shadow-sm">
                        No active job postings match your current filter selection. Try adjusting your keywords!
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredJobs.map(job => {
                            const hasApplied = appliedJobIds.has(job.id);

                            return (
                                <div key={job.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                    <span className="inline-block bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full mb-2">
                      {job.jobType.replace('_', ' ')}
                    </span>
                                        <h2 className="text-xl font-bold text-slate-900">{job.title}</h2>
                                        <p className="text-slate-700 font-semibold mt-0.5">{job.companyName}</p>

                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mt-3 font-medium">
                                            <span className="flex items-center gap-1">📍 {job.location}</span>
                                            {job.salaryRange && <span className="flex items-center gap-1">💼 {job.salaryRange}</span>}
                                            <span className="flex items-center gap-1">⏱️ {job.experienceRequired}Y+ Exp</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleApply(job.id)}
                                        disabled={hasApplied || submittingId === job.id}
                                        className={`w-full md:w-auto font-bold px-6 py-2.5 rounded-xl transition shadow-sm ${
                                            hasApplied
                                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
                                        }`}
                                    >
                                        {submittingId === job.id ? 'Submitting...' : hasApplied ? '✓ Applied' : 'Apply Now'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}