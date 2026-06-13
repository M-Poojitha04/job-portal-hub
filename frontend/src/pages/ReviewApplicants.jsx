import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from 'axios';

export default function ReviewApplicants() {
    const { jobId } = useParams();
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchApplicants();
    }, [jobId]);

    const fetchApplicants = () => {
        const token = localStorage.getItem('token');
        axiosInstance.get(`http://localhost:8080/api/v1/applications/job/${jobId}`, {
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
    };

    const handleStatusChange = async (appId, newStatus) => {
        setUpdatingId(appId);
        const token = localStorage.getItem('token');

        try {
            await axiosInstance.put(`http://localhost:8080/api/v1/applications/${appId}/status?status=${newStatus}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Refresh local array state seamlessly
            setApps(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
        } catch (err) {
            alert('Failed to update applicant status.');
        } finally {
            setUpdatingId(null);
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
                            <div key={app.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Candidate ID Reference: #{app.id}</h3>
                                    <p className="text-slate-500 font-semibold text-sm mt-0.5">Applied on: {new Date(app.appliedAt).toLocaleDateString()}</p>
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                                    <span className="text-sm font-bold text-slate-500">Pipeline Stage:</span>
                                    <select
                                        value={app.status}
                                        disabled={updatingId === app.id}
                                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                        className="px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm font-bold outline-none focus:border-blue-500 disabled:opacity-50"
                                    >
                                        <option value="APPLIED">Applied</option>
                                        <option value="REVIEWING">Reviewing</option>
                                        <option value="ACCEPTED">Accepted</option>
                                        <option value="REJECTED">Rejected</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}