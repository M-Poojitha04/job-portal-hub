import { useState, useEffect } from 'react';
import axios from 'axios'; // Standard Axios import
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

export default function JobSearch() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [appliedJobIds, setAppliedJobIds] = useState(new Set());
    const [submittingId, setSubmittingId] = useState(null);
    const [bookmarkedJobIds, setBookmarkedJobIds] = useState(new Set());

    // --- DIALOG OVERLAY VIEW TRACKER HOOK ---
    const [selectedJob, setSelectedJob] = useState(null);

    // --- Filter States ---
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('ALL');
    const [selectedType, setSelectedType] = useState('ALL');

    const { user } = useAuth();
    const location = useLocation();
    const token = localStorage.getItem('token');

    // Extract dynamic redirect text from state parameters passed down from the homepage
    const guestNoticeMessage = location.state?.message || "Please create an account or sign in to access the active corporate job feed.";

    // 1. Initial Fetch Hook: Load user bookmarks ONLY if authenticated
    useEffect(() => {
        // 🛠️ CRITICAL GUARDRAIL: If token is null, undefined, or empty, DO NOT fire the network request!
        if (!token || token === "null" || token === "undefined") {
            return;
        }

        axios.get('http://localhost:8080/api/v1/bookmarks/my-bookmarks', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (Array.isArray(res.data)) {
                    const savedIds = new Set(
                        res.data
                            .filter(b => b && b.job && b.job.id)
                            .map(b => b.job.id)
                    );
                    setBookmarkedJobIds(savedIds);
                }
            })
            .catch(err => console.log("Bookmarks sync deferred.", err));
    }, [token]);

    // 2. Secondary Fetch Hook: Load all active job postings ONLY if authenticated
    useEffect(() => {
        // 🛠️ CRITICAL GUARDRAIL: Same check here to prevent pre-load 403s
        if (!token || token === "null" || token === "undefined") {
            setLoading(false);
            return;
        }

        axios.get('http://localhost:8080/api/v1/jobs', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                setJobs(response.data);
                setLoading(false);
            })
            .catch(err => {
                setError('Failed to fetch job postings. Please try again later.');
                setLoading(false);
            });
    }, [token]);
    // --- GUEST AUTHENTICATION GATE ---
    if (!token) {
        return (
            <div className="min-h-[75vh] bg-slate-50 flex items-center justify-center px-4 py-16">
                <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 p-8 text-center shadow-xl shadow-slate-100">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-5">🔒</div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Authentication Required</h2>
                    <p className="text-sm font-medium text-slate-500 mt-3 leading-relaxed">{guestNoticeMessage}</p>
                    <div className="mt-8 space-y-3">
                        <Link to="/login" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-blue-100 transition text-sm text-center">Sign In to My Account</Link>
                        <Link to="/register" className="block w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold py-3 px-4 rounded-xl transition text-sm text-center">Create New Account</Link>
                    </div>
                    <Link to="/" className="inline-block mt-6 text-xs text-slate-400 font-bold hover:text-blue-600 transition underline decoration-2">← Back to Homepage</Link>
                </div>
            </div>
        );
    }

// Interactive Action: Bookmark Toggle Engine Handler
    const handleBookmarkToggle = async (jobId) => {
        try {
            const res = await axios.post(`http://localhost:8080/api/v1/bookmarks/toggle/${jobId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setBookmarkedJobIds(prev => {
                const next = new Set(prev);
                if (res.data.bookmarked) {
                    next.add(jobId);
                } else {
                    next.delete(jobId);
                }
                return next;
            });
        } catch (err) {
            alert("Could not update bookmark state.");
        }
    };

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

    // --- Dynamic Live Filter Logic ---
    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.companyName?.toLowerCase().includes(searchQuery.toLowerCase());

        const cleanJobLocation = job.location?.toLowerCase().replace('-', '') || '';
        const cleanSelectedLocation = selectedLocation.toLowerCase().replace('-', '');

        const matchesLocation = selectedLocation === 'ALL' || cleanJobLocation.includes(cleanSelectedLocation);
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

                {/* Search & Filter Panel */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Search Keywords</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by job title or company name..."
                                className="w-full pl-4 pr-10 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium text-sm text-slate-800"
                            />
                            <span className="absolute right-3.5 top-3 text-slate-400">🔍</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Workplace Type</label>
                        <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
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
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
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
                            const isBookmarked = bookmarkedJobIds.has(job.id);

                            return (
                                <div
                                    key={job.id}
                                    onClick={() => setSelectedJob(job)}
                                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-500/40 hover:shadow-md transition duration-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer text-left"
                                >
                                    <div>
                                        <span className="inline-block bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full mb-2">
                                            {job.jobType?.replace('_', ' ') || 'N/A'}
                                        </span>
                                        <h2 className="text-xl font-bold text-slate-900">{job.title}</h2>
                                        <p className="text-slate-700 font-semibold mt-0.5">{job.companyName}</p>

                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mt-3 font-medium">
                                            <span className="flex items-center gap-1">📍 {job.location}</span>
                                            {job.salaryRange && <span className="flex items-center gap-1">💼 {job.salaryRange}</span>}
                                            <span className="flex items-center gap-1">⏱️ {job.experienceRequired}Y+ Exp</span>
                                        </div>
                                    </div>

                                    <div
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100"
                                    >
                                        <button
                                            onClick={() => handleBookmarkToggle(job.id)}
                                            className={`p-2.5 rounded-xl border transition text-sm flex items-center justify-center font-bold shadow-sm ${
                                                isBookmarked
                                                    ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                            }`}
                                            title={isBookmarked ? "Remove Bookmark" : "Save Position"}
                                        >
                                            {isBookmarked ? '🔖 Saved' : '🔖 Save'}
                                        </button>

                                        <button
                                            onClick={() => handleApply(job.id)}
                                            disabled={hasApplied || submittingId === job.id}
                                            className={`font-bold px-6 py-2.5 rounded-xl transition shadow-sm flex-1 md:flex-initial ${
                                                hasApplied
                                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-not-allowed'
                                                    : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
                                            }`}
                                        >
                                            {submittingId === job.id ? 'Submitting...' : hasApplied ? '✓ Applied' : 'Apply Now'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* --- DETAILED DIALOG MODAL LAYER OVERLAY --- */}
                {selectedJob && (() => {
                    const hasApplied = appliedJobIds.has(selectedJob.id);
                    const isBookmarked = bookmarkedJobIds.has(selectedJob.id);

                    return (
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
                            <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl border border-slate-100 p-8 relative max-h-[85vh] overflow-y-auto flex flex-col text-left scale-100 transition-transform">

                                <button
                                    onClick={() => setSelectedJob(null)}
                                    className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition outline-none"
                                >
                                    ✕
                                </button>

                                <div className="border-b border-slate-100 pb-4 mb-5">
                                    <span className="inline-block text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full tracking-wider uppercase mb-2">
                                        {selectedJob.jobType?.replace('_', ' ') || 'N/A'}
                                    </span>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedJob.title}</h2>
                                    <p className="text-base font-bold text-blue-600 mt-0.5">{selectedJob.companyName}</p>
                                </div>

                                <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200/50 rounded-2xl mb-6 text-center">
                                    <div>
                                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</span>
                                        <span className="text-xs font-black text-slate-700 block mt-1">📍 {selectedJob.location}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Salary</span>
                                        <span className="text-xs font-black text-slate-700 block mt-1">💰 {selectedJob.salaryRange || 'Not Stated'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Experience</span>
                                        <span className="text-xs font-black text-slate-700 block mt-1">💼 {selectedJob.experienceRequired}Y+ Req</span>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-2 mb-6">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Role Specifications & Description</h4>
                                    <p className="text-sm font-medium text-slate-600 leading-relaxed bg-slate-50/40 p-4 border border-slate-100 rounded-xl whitespace-pre-line">
                                        {selectedJob.description || "No description provided for this opening."}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                                    <button
                                        onClick={() => handleBookmarkToggle(selectedJob.id)}
                                        className={`px-5 py-3 rounded-xl border font-bold text-sm transition flex items-center justify-center gap-1.5 shadow-sm ${
                                            isBookmarked
                                                ? 'bg-amber-50 text-amber-600 border-amber-200'
                                                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        {isBookmarked ? '🔖 Saved' : '🔖 Save'}
                                    </button>

                                    <button
                                        onClick={() => {
                                            handleApply(selectedJob.id);
                                        }}
                                        disabled={hasApplied || submittingId === selectedJob.id}
                                        className={`flex-1 font-bold py-3 rounded-xl transition shadow-md shadow-blue-100 text-sm ${
                                            hasApplied
                                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-not-allowed shadow-none'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
                                        }`}
                                    >
                                        {submittingId === selectedJob.id ? 'Submitting...' : hasApplied ? '✓ Application Submitted' : 'Apply For Position Now'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
}