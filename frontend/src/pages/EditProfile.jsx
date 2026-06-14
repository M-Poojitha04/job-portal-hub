import { useState, useEffect } from 'react';
import axiosInstance from 'axios';

export default function EditProfile() {
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        headline: '',
        profilePicUrl: '',
        resumeUrl: ''
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        axiosInstance.get('http://localhost:8080/api/v1/profiles/my-profile', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (res.data) {
                    setProfile({
                        firstName: res.data.firstName || '',
                        lastName: res.data.lastName || '',
                        phone: res.data.phone || '',
                        headline: res.data.headline || '',
                        profilePicUrl: res.data.profilePicUrl || '',
                        resumeUrl: res.data.resumeUrl || ''
                    });
                }
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to fetch profile settings metadata.');
                setLoading(false);
            });
    }, []);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Enforce client-side file extension checkpoint validation
        if (file.type !== "application/pdf") {
            setError("Please select a valid PDF file document.");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setMessage('');
        setError('');
        const token = localStorage.getItem('token');

        try {
            const res = await axiosInstance.post('http://localhost:8080/api/v1/profiles/upload-resume', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            setProfile(prev => ({ ...prev, resumeUrl: res.data.resumeUrl }));
            setMessage('✓ PDF Resume uploaded and compiled safely to local system directory!');
        } catch (err) {
            setError(err.response?.data || 'Failed to upload resume file.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        const token = localStorage.getItem('token');

        try {
            await axiosInstance.put('http://localhost:8080/api/v1/profiles/update', profile, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('✓ Your professional profile was successfully updated!');
        } catch {
            setError('An error occurred while saving profile metrics data.');
        }
    };

    if (loading) return <div className="text-center py-20 font-medium text-slate-600">Loading your profile workspace...</div>;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Professional Profile</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage the identity metrics displayed to recruiters during application cycles.</p>
                </div>

                {message && <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold rounded-xl mb-6">{message}</div>}
                {error && <div className="p-4 bg-red-50 border border-red-200 text-red-600 font-semibold rounded-xl mb-6">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5 text-sm font-bold text-slate-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1.5">First Name</label>
                            <input type="text" value={profile.firstName} onChange={e => setProfile({...profile, firstName: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium" placeholder="Jane" />
                        </div>
                        <div>
                            <label className="block mb-1.5">Last Name</label>
                            <input type="text" value={profile.lastName} onChange={e => setProfile({...profile, lastName: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium" placeholder="Doe" />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-1.5">Professional Headline</label>
                        <input type="text" value={profile.headline} onChange={e => setProfile({...profile, headline: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium" placeholder="Full Stack Engineer | Spring Boot & React" />
                    </div>

                    <div>
                        <label className="block mb-1.5">Phone Number</label>
                        <input type="text" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium" placeholder="+1 (555) 000-0000" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1.5">Avatar Image URL</label>
                            <input type="text" value={profile.profilePicUrl} onChange={e => setProfile({...profile, profilePicUrl: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium font-mono text-xs" placeholder="https://example.com/avatar.png" />
                        </div>
                        <div>
                            <label className="block mb-1.5">Upload PDF Resume</label>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileUpload}
                                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer"
                            />
                            {uploading && <p className="text-xs text-blue-500 mt-1 font-medium animate-pulse">Uploading file stream...</p>}
                            {profile.resumeUrl && (
                                <p className="text-xs text-slate-400 mt-2 font-medium truncate">
                                    Active file: <a href={`http://localhost:8080${profile.resumeUrl}`} target="_blank" rel="noreferrer" className="text-blue-500 underline font-bold">{profile.resumeUrl}</a>
                                </p>
                            )}
                        </div>
                    </div>

                    <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-md shadow-blue-100">
                        Save Structural Changes
                    </button>
                </form>
            </div>
        </div>
    );
}