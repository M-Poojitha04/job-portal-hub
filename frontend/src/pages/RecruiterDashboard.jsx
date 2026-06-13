import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function RecruiterDashboard() {
    const [myJobs, setMyJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');

        axios.get('http://localhost:8080/api/v1/jobs/my-postings', {
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
    }, []);

    if (loading) return <div className="text-center py-20 font-medium text-slate-600">Loading your dashboard...</div>;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">

                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Recruiter Dashboard</h1>
                        <p className="text-slate-500 mt-2 font-medium">Manage your active corporate listings and incoming candidate pools.</p>
                    </div>
                    <Link to="/post-job" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition shadow-md shadow-blue-100">
                        + Post New Position
                    </Link>
                </div>

                {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6 font-semibold">{error}</div>}

                {/* Analytics Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Active Postings</p>
                        <p className="text-4xl font-black text-blue-600 mt-2">{myJobs.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Applications Received</p>
                        <p className="text-4xl font-black text-slate-400 mt-2">0</p>
                        <span className="text-xs text-slate-400 font-semibold">(Module coming up next)</span>
                    </div>
                </div>

                {/* Job Postings Table / Grid */}
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Active Listings</h2>

                {myJobs.length === 0 ? (
                    <div className="bg-white text-center p-12 rounded-2xl border border-slate-200 text-slate-500 font-medium">
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
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 text-slate-700 text-sm font-medium">
                                {myJobs.map(job => (
                                    <tr key={job.id} className="hover:bg-slate-50/50 transition">
                                        <td className="p-4 font-bold text-slate-900">{job.title}</td>
                                        <td className="p-4">📍 {job.location}</td>
                                        <td className="p-4">
                        <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-md">
                          {job.jobType.replace('_', ' ')}
                        </span>
                                        </td>
                                        <td className="p-4">{new Date(job.createdAt).toLocaleDateString()}</td>
                                        <td className="p-4 text-center">
                        <span className="bg-green-50 text-green-600 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200">
                          {job.status}
                        </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <Link to={`/review-applicants/${job.id}`} className="text-blue-600 hover:text-blue-800 font-bold text-xs underline">
                                                View Applicants
                                            </Link>
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