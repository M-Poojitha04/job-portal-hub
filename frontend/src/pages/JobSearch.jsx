import { useState, useEffect } from 'react';
import axios from 'axios';

export default function JobSearch() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    if (loading) return <div className="text-center py-20 font-medium text-slate-600">Loading active opportunities...</div>;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Explore Opportunities</h1>
                    <p className="text-slate-500 mt-2 font-medium">Discover your next career milestone backed by relational database tracking.</p>
                </div>

                {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6 font-semibold">{error}</div>}

                {jobs.length === 0 ? (
                    <div className="bg-white text-center p-12 rounded-2xl border border-slate-200 text-slate-500 font-medium">
                        No active job postings found. Recruiters haven't published positions yet!
                    </div>
                ) : (
                    <div className="space-y-4">
                        {jobs.map(job => (
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

                                <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl transition shadow-sm">
                                    Apply Now
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}