import { useState, useEffect } from 'react';
import axiosInstance from 'axios';

export default function CandidateApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMyApplications();
    }, []);

    const fetchMyApplications = () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Force raw axios with a clean, manual header configuration
        import('axios').then((rawAxios) => {
            rawAxios.default.get('http://localhost:8080/api/v1/applications/my-applications', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    setApplications(res.data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error("Fetch history error status:", err.response?.status);
                    setError('Failed to pull your application history logs.');
                    setLoading(false);
                });
        });
    };

    const handleWithdraw = async (appId) => {
        if (!window.confirm("Are you sure you want to withdraw this application? This action will remove you from active recruitment consideration.")) return;
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const rawAxios = (await import('axios')).default;
            await rawAxios.put(`http://localhost:8080/api/v1/applications/${appId}/withdraw`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Update local state dynamically
            setApplications(prev => prev.map(app =>
                app.id === appId ? { ...app, status: 'WITHDRAWN' } : app
            ));
        } catch (err) {
            alert("Failed to process your request. Please try again.");
        }
    };


    // Timeline Step Generator Configuration helper
    const getStepStatusClass = (currentStatus, targetStep) => {
        const stages = ['APPLIED', 'REVIEWING', 'ACCEPTED'];
        if (currentStatus === 'REJECTED' || currentStatus === 'WITHDRAWN') return 'bg-slate-200 text-slate-400';

        const currentIndex = stages.indexOf(currentStatus);
        const targetIndex = stages.indexOf(targetStep);

        if (currentIndex >= targetIndex) {
            return 'bg-blue-600 text-white border-blue-600'; // Completed or Active Step
        }
        return 'bg-white text-slate-400 border-slate-200'; // Pending Step
    };

    if (loading) return <div className="text-center py-20 font-medium text-slate-600">Loading your application tracking logs...</div>;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">

                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Applications</h1>
                    <p className="text-slate-500 font-medium mt-1">Track your active submission statuses and career pipeline interactions in real-time.</p>
                </div>

                {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6 font-semibold">{error}</div>}

                {applications.length === 0 ? (
                    <div className="bg-white text-center p-12 rounded-2xl border border-slate-200 text-slate-500 font-medium shadow-sm">
                        You haven't submitted any job applications yet. Head over to "Browse Jobs" to find your next role!
                    </div>
                ) : (
                    <div className="space-y-6">
                        {applications.map(app => (
                            <div key={app.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">

                                {/* Upper row header cards info context panel */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4 mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">{app.job.title}</h3>
                                        <p className="text-sm font-semibold text-slate-500 mt-0.5">🏢 {app.job.companyName} • 📍 {app.job.location}</p>
                                        <span className="text-[11px] font-medium text-slate-400 block mt-1">Submitted on: {new Date(app.appliedAt).toLocaleDateString()}</span>
                                    </div>

                                    {/* Right side dynamic absolute system contextual badges */}
                                    <div>
                                        {app.status === 'REJECTED' && (
                                            <span className="bg-red-50 text-red-600 border border-red-200 font-bold text-xs px-3 py-1 rounded-full">Rejected</span>
                                        )}
                                        {app.status === 'WITHDRAWN' && (
                                            <span className="bg-slate-100 text-slate-500 border border-slate-200 font-bold text-xs px-3 py-1 rounded-full">Withdrawn</span>
                                        )}
                                        {(app.status !== 'REJECTED' && app.status !== 'WITHDRAWN') && (
                                            <span className="bg-blue-50 text-blue-600 border border-blue-100 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">{app.status}</span>
                                        )}
                                    </div>
                                </div>

                                {/* --- PIPELINE VISUAL TIMELINE STEP TRACKER BAR --- */}
                                {app.status !== 'WITHDRAWN' && app.status !== 'REJECTED' ? (
                                    <div className="mb-6 max-w-xl mx-auto pt-2">
                                        <div className="flex items-center justify-between relative">
                                            {/* Central connection line back drop indicator */}
                                            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-100 -z-10"></div>

                                            {/* Step 1: Applied */}
                                            <div className="flex flex-col items-center gap-1.5 bg-white px-2">
                                                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-colors ${getStepStatusClass(app.status, 'APPLIED')}`}>1</div>
                                                <span className="text-[11px] font-bold text-slate-500">Applied</span>
                                            </div>

                                            {/* Step 2: Reviewing */}
                                            <div className="flex flex-col items-center gap-1.5 bg-white px-2">
                                                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-colors ${getStepStatusClass(app.status, 'REVIEWING')}`}>2</div>
                                                <span className="text-[11px] font-bold text-slate-500">Reviewing</span>
                                            </div>

                                            {/* Step 3: Accepted */}
                                            <div className="flex flex-col items-center gap-1.5 bg-white px-2">
                                                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-colors ${getStepStatusClass(app.status, 'ACCEPTED')}`}>3</div>
                                                <span className="text-[11px] font-bold text-slate-600">Decision</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-semibold text-slate-500 mb-4">
                                        {app.status === 'WITHDRAWN'
                                            ? "You withdrew from this application process. This position is no longer active in your recruitment tracking pool."
                                            : "The hiring team has processed reviews and decided not to move forward with your profile for this specific role."}
                                    </div>
                                )}

                                {/* Interactive Operations Footer Controls bar */}
                                {app.status !== 'WITHDRAWN' && app.status !== 'REJECTED' && app.status !== 'ACCEPTED' && (
                                    <div className="flex justify-end pt-2">
                                        <button
                                            onClick={() => handleWithdraw(app.id)}
                                            className="text-xs font-bold text-slate-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-xl border border-transparent hover:border-red-100 transition"
                                        >
                                            Withdraw Application
                                        </button>
                                    </div>
                                )}

                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}