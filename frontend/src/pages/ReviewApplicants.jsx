import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function ReviewApplicants() {
    const { jobId } = useParams();
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState(null);

    // Scheduler form handling hooks
    const [selectedAppId, setSelectedAppId] = useState(null);
    const [interviewDate, setInterviewDate] = useState('');
    const [meetingLink, setMeetingLink] = useState('');

    useEffect(() => {
        fetchApplicants();
    }, [jobId]);

    const fetchApplicants = () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        import('axios').then((rawAxios) => {
            rawAxios.default.get(`http://localhost:8080/api/v1/applications/job/${jobId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    setApps(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    setError('Failed to fetch applicants for this position.');
                    setLoading(false);
                });
        });
    };

    const handleStatusChange = async (appId, newStatus) => {
        setUpdatingId(appId);
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const rawAxios = (await import('axios')).default;
            await rawAxios.put(`http://localhost:8080/api/v1/applications/${appId}/status?status=${newStatus}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setApps(prev => prev.map(a => a.applicationId === appId ? { ...a, status: newStatus } : a));
        } catch (err) {
            alert('Failed to update applicant status.');
        }
        finally {
            setUpdatingId(null);
        }
    };

    const handleScheduleInterview = async (e, appId) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!interviewDate || !meetingLink) return alert("Please specify both date and meeting URL.");

        try {
            const rawAxios = (await import('axios')).default;
            await rawAxios.default.post(`http://localhost:8080/api/v1/interviews/${appId}`, {
                interviewDate,
                meetingLink
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Interview successfully scheduled!");
            setSelectedAppId(null); // Clear panel tray
            setInterviewDate('');
            setMeetingLink('');
        } catch (err) {
            alert("Could not process interview registration slot.");
        }
    };

    if (loading) return <div className="text-center py-20 font-medium text-slate-600">Loading applicant pipeline details...</div>;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex items-center gap-4">
                    <Link to="/dashboard" className="text-sm font-bold text-blue-600 hover:underline">← Back to Dashboard</Link>
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Incoming Applicants</h1>
                    <p className="text-slate-500 font-medium mt-1">Review applicant profiles and update application pipelines.</p>
                </div>

                {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6 font-semibold">{error}</div>}

                {apps.length === 0 ? (
                    <div className="bg-white text-center p-12 rounded-2xl border border-slate-200 text-slate-500 font-medium shadow-sm">
                        No candidates have submitted applications for this position yet.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {apps.map(app => (
                            <div key={app.applicationId} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-bold text-slate-900">
                                                {app.firstName} {app.lastName}
                                            </h3>
                                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono font-bold">
                                                App ID: #{app.applicationId}
                                            </span>
                                        </div>

                                        <p className="text-sm font-semibold text-blue-600 bg-blue-50/50 inline-block px-3 py-1 rounded-xl">
                                            {app.headline}
                                        </p>

                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-medium pt-1">
                                            <span>✉ {app.email}</span>
                                            <span>📞 {app.phone}</span>
                                            <span>⏱ Applied on: {new Date(app.appliedAt).toLocaleDateString()}</span>
                                        </div>

                                        <div className="pt-2 flex flex-wrap gap-2">
                                            <a
                                                href={`http://localhost:8080${app.resumeUrl}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition"
                                            >
                                                👁️ Preview in Tab
                                            </a>

                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    const token = localStorage.getItem('token');
                                                    if (!token) return;

                                                    import('axios').then((rawAxios) => {
                                                        rawAxios.default.get(`http://localhost:8080/api/v1/profiles/download-resume/${app.applicationId}`, {
                                                            responseType: 'blob',
                                                            headers: { 'Authorization': `Bearer ${token}` }
                                                        })
                                                            .then((response) => {
                                                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                                                const link = document.createElement('a');
                                                                link.href = url;
                                                                link.setAttribute('download', `${app.firstName}_${app.lastName}_Resume.pdf`);
                                                                document.body.appendChild(link);
                                                                link.click();
                                                                link.remove();
                                                            })
                                                            .catch(() => alert("Could not fetch the document binary from ledger file storage logs."));
                                                    });
                                                }}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition cursor-pointer"
                                            >
                                                📥 Download PDF Document
                                            </a>

                                            <button
                                                onClick={() => setSelectedAppId(selectedAppId === app.applicationId ? null : app.applicationId)}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 transition"
                                            >
                                                📅 Schedule Interview
                                            </button>
                                        </div>
                                    </div>

                                    {/* Status Control */}
                                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                                        <span className="text-sm font-bold text-slate-500">Pipeline Stage:</span>
                                        <select
                                            value={app.status}
                                            disabled={updatingId === app.applicationId}
                                            onChange={(e) => handleStatusChange(app.applicationId, e.target.value)}
                                            className="px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm font-bold outline-none focus:border-blue-500 disabled:opacity-50 shadow-sm"
                                        >
                                            <option value="APPLIED">Applied</option>
                                            <option value="REVIEWING">Reviewing</option>
                                            <option value="ACCEPTED">Accepted</option>
                                            <option value="REJECTED">Rejected</option>
                                        </select>
                                    </div>
                                </div>

                                {/* --- INLINE SCHEDULER FORM TRAY --- */}
                                {selectedAppId === app.applicationId && (
                                    <form onSubmit={(e) => handleScheduleInterview(e, app.applicationId)} className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 items-end animate-fadeIn">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Date & Time</label>
                                            <input
                                                type="datetime-local"
                                                value={interviewDate}
                                                onChange={(e) => setInterviewDate(e.target.value)}
                                                className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-lg outline-none bg-white focus:border-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Meeting Link (Zoom/Meet)</label>
                                            <input
                                                type="url"
                                                placeholder="https://meet.google.com/abc"
                                                value={meetingLink}
                                                onChange={(e) => setMeetingLink(e.target.value)}
                                                className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-lg outline-none bg-white focus:border-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <button type="submit" className="w-full text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white p-2.5 rounded-lg transition shadow-md">
                                                Confirm Schedule Slot
                                            </button>
                                        </div>
                                    </form>
                                )}

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}