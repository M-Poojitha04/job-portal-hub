import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function RecruiterDashboard() {
    const [myJobs, setMyJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- Dynamic Advanced Analytics Hooks ---
    const [metrics, setMetrics] = useState({
        totalJobsPosted: 0,
        totalApplicationsReceived: 0,
        pendingReviewsCount: 0,
        placementRatePercentage: 0,
        topPerformingListing: 'None'
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch primary recruiter job posts
        import('axios').then((rawAxios) => {
            rawAxios.default.get('http://localhost:8080/api/v1/jobs/my-postings', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(response => {
                    setMyJobs(response.data);
                    setLoading(false);
                })
                .catch(err => {
                    setError('Failed to load your job postings. Please try again.');
                    setLoading(false);
                });
        });

        // Fetch advanced database portfolio analytics metrics
        const fetchDashboardMetrics = () => {
            import('axios').then((rawAxios) => {
                rawAxios.default.get('http://localhost:8080/api/v1/analytics/recruiter-summary', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                    .then(res => setMetrics(res.data))
                    .catch(err => console.log("Analytics aggregation sync delayed:", err));
            });
        };

        fetchDashboardMetrics();
    }, []);

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm("Are you sure you want to delete this job listing? This will remove all associated data lines.")) return;

        const token = localStorage.getItem('token');
        try {
            const rawAxios = (await import('axios')).default;
            await rawAxios.delete(`http://localhost:8080/api/v1/jobs/${jobId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMyJobs(prev => prev.filter(job => job.id !== jobId));

            // Recalculate summary live if a listing gets hard-deleted
            window.location.reload();
        } catch (err) {
            alert("Failed to delete the job posting. Please try again.");
        }
    };

    if (loading) return <div className="text-center py-20 font-medium text-slate-600">Loading your dashboard...</div>;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">

                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Recruiter Dashboard</h1>
                        <p className="text-slate-500 mt-2 font-medium">Manage your active corporate listings and incoming candidate pools.</p>
                    </div>
                    <Link to="/post-job" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition shadow-md shadow-blue-100">
                        + Post New Position
                    </Link>
                </div>

                {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6 font-semibold">{error}</div>}

                {/* --- MODULE 4: UPGRADED ADVANCED METRICS ANALYTICS PANEL GRID --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

                    {/* Metric Card 1: Total Volume */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Positions Posted</span>
                            <span className="block text-3xl font-black text-slate-800 mt-1">{metrics.totalJobsPosted}</span>
                        </div>
                        <div className="text-2xl bg-blue-50 w-11 h-11 rounded-xl flex items-center justify-center text-blue-600">📁</div>
                    </div>

                    {/* Metric Card 2: Application Flow */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Applications Handled</span>
                            <span className="block text-3xl font-black text-slate-800 mt-1">{metrics.totalApplicationsReceived}</span>
                        </div>
                        <div className="text-2xl bg-purple-50 w-11 h-11 rounded-xl flex items-center justify-center text-purple-600">📈</div>
                    </div>

                    {/* Metric Card 3: Pending Pipelines */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Screenings</span>
                            <span className="block text-3xl font-black text-slate-800 mt-1">{metrics.pendingReviewsCount}</span>
                        </div>
                        <div className="text-2xl bg-amber-50 w-11 h-11 rounded-xl flex items-center justify-center text-amber-600">⏳</div>
                    </div>

                    {/* Metric Card 4: Funnel Selection Performance */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hiring Placement Rate</span>
                            <span className="block text-3xl font-black text-slate-800 mt-1">{metrics.placementRatePercentage}%</span>
                        </div>
                        <div className="text-2xl bg-emerald-50 w-11 h-11 rounded-xl flex items-center justify-center text-emerald-600">🎯</div>
                    </div>

                </div>

                {/* Highlight Banner: Top Performing Attraction Posting */}
                <div className="mb-10 p-4 bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">Trending Listing Target</span>
                        <p className="text-sm font-bold mt-0.5">Most Applied Position: <span className="text-blue-300 underline font-black decoration-wavy ml-1">{metrics.topPerformingListing}</span></p>
                    </div>
                    <span className="text-xs bg-white/10 font-bold px-3 py-1 rounded-lg backdrop-blur-md">🔥 Hot Posting</span>
                </div>

                {/* Job Postings Table / Grid */}
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Active Listings</h2>

                {myJobs.length === 0 ? (
                    <div className="bg-white text-center p-12 rounded-2xl border border-slate-200 text-slate-500 font-medium shadow-sm">
                        You haven't published any job positions yet. Click "+ Post New Position" to begin.
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm font-bold">
                                    <th className="p-4">Job Title</th>
                                    <th className="p-4">Location</th>
                                    <th className="p-4">Job Type</th>
                                    <th className="p-4">Date Posted</th>
                                    <th className="p-4 text-center">Status</th>
                                    <th className="p-4 text-center">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 text-slate-700 text-sm font-medium">
                                {myJobs.map(job => (
                                    <tr key={job.id} className="hover:bg-slate-50/50 transition">
                                        <td className="p-4 font-bold text-slate-900">{job.title}</td>
                                        <td className="p-4">📍 {job.location}</td>
                                        <td className="p-4">
                                            <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-md">
                                              {job.jobType ? job.jobType.replace('_', ' ') : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="p-4">{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recent'}</td>
                                        <td className="p-4 text-center">
                                            <span className="bg-green-50 text-green-600 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200">
                                              {job.status || 'ACTIVE'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center space-x-4">
                                            <Link to={`/review-applicants/${job.id}`} className="text-blue-600 hover:text-blue-800 font-bold text-xs underline">
                                                View Applicants
                                            </Link>
                                            <Link to={`/edit-job/${job.id}`} className="text-amber-600 hover:text-amber-800 font-bold text-xs underline">
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteJob(job.id)}
                                                className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-3 py-1.5 rounded-xl transition"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}