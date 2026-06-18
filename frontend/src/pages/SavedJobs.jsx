import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function SavedJobs() {
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSavedJobs();
    }, []);

    const fetchSavedJobs = () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        import('axios').then((rawAxios) => {
            rawAxios.default.get('http://localhost:8080/api/v1/bookmarks/my-bookmarks', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    // ✅ DEFENSIVE CHECK: Always fall back to an array to prevent breaking on empty loads
                    setBookmarks(Array.isArray(res.data) ? res.data : []);
                    setLoading(false);
                })
                .catch(() => {
                    setBookmarks([]);
                    setLoading(false);
                });
        });
    };

    const handleRemoveBookmark = async (jobId) => {
        const token = localStorage.getItem('token');
        try {
            const rawAxios = (await import('axios')).default;
            await rawAxios.default.post(`http://localhost:8080/api/v1/bookmarks/toggle/${jobId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Track clean nested structure safely
            setBookmarks(prev => prev.filter(b => b?.job?.id !== jobId));
        } catch (err) {
            alert("Could not update bookmark state.");
        }
    };

    if (loading) return <div className="text-center py-20 font-medium text-slate-600">Loading your saved jobs pool...</div>;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Saved Positions</h1>
                    <p className="text-slate-500 font-medium mt-1">Keep track of interesting job openings and apply whenever you are ready.</p>
                </div>

                {bookmarks.length === 0 ? (
                    <div className="bg-white text-center p-12 rounded-2xl border border-slate-200 text-slate-500 font-medium shadow-sm">
                        No bookmarked job positions found. Browse positions to start saving options.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {bookmarks.map(b => {
                            // Guard check to make sure nested object exists before rendering properties
                            if (!b || !b.job) return null;

                            return (
                                <div key={b.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">{b.job.title}</h3>
                                        <p className="text-sm font-semibold text-slate-500 mt-0.5">🏢 {b.job.companyName || 'Corporate'} • 📍 {b.job.location}</p>
                                        <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold mt-2 inline-block">
                                            {b.job.jobType ? b.job.jobType.replace('_', ' ') : 'Full Time'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                        <button
                                            onClick={() => handleRemoveBookmark(b.job.id)}
                                            className="text-xs font-bold text-slate-400 hover:text-red-500 transition px-3 py-2"
                                        >
                                            Remove
                                        </button>
                                        <Link
                                            to={`/browse?jobId=${b.job.id}`}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm"
                                        >
                                            View Details & Apply
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}