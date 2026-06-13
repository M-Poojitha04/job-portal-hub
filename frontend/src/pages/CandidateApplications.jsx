import { useState, useEffect } from 'react';
import axios from 'axios';

export default function CandidateApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');

        axios.get('http://localhost:8080/api/v1/applications/my-applications', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                setApplications(response.data);
                setLoading(false);
            })
            .catch(err => {
                setError('Failed to fetch your application history. Please try again.');
                setLoading(false);
            });
    }, []);

    // Utility helper to assign custom pill colors based on dynamic status fields
    const getStatusBadge = (status) => {
        switch(status) {
            case 'ACCEPTED':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'REJECTED':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            case 'REVIEWING':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            default:
                return 'bg-blue-50 text-blue-700 border-blue-200';
        }
    };

    if (loading) return <div className="text-center py-20 font-medium text-slate-600">Loading your history pipeline...</div>;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Your Applications</h1>
                    <p className="text-slate-500 mt-2 font-medium">Track your active submission statuses and career pipeline interactions.</p>
                </div>

                {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6 font-semibold border border-red-200">{error}</div>}

                {applications.length === 0 ? (
                    <div className="bg-white text-center p-12 rounded-2xl border border-slate-200 text-slate-500 font-medium shadow-sm">
                        You haven't submitted any job applications yet. Go browse open opportunities to begin!
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map(app => (
                            <div key={app.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">{app.job.title}</h2>
                                    <p className="text-slate-700 font-semibold text-sm mt-0.5">{app.job.companyName}</p>
                                    <p className="text-xs text-slate-400 mt-2 font-medium">
                                        Submitted on {new Date(app.appliedAt).toLocaleDateString()} at {new Date(app.appliedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                                    <span className="text-xs text-slate-400 font-semibold sm:hidden">Current Status:</span>
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusBadge(app.status)}`}>
                    {app.status}
                  </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}