import { useState, useEffect } from 'react';
import axiosInstance from 'axios';

export default function EditProfile() {
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        headline: '',
        profilePicUrl: '',
        resumeUrl: '',
        skills: [],
        educationList: [],
        experienceList: []
    });

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);

    // Skill Input Field State Hook Tracker
    const [skillInput, setSkillInput] = useState('');

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
                        resumeUrl: res.data.resumeUrl || '',
                        skills: res.data.skills || [],
                        educationList: res.data.educationList || [],
                        experienceList: res.data.experienceList || []
                    });
                }
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to fetch profile settings metadata.');
                setLoading(false);
            });
    }, []);

    // --- Dynamic Skills Interaction Handlers ---
    const handleAddSkill = (e) => {
        e.preventDefault();
        const cleanSkill = skillInput.trim();
        if (cleanSkill && !profile.skills.includes(cleanSkill)) {
            setProfile(prev => ({ ...prev, skills: [...prev.skills, cleanSkill] }));
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setProfile(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
    };

    // --- Dynamic Education Collection Item Manipulation ---
    const handleAddEducation = () => {
        setProfile(prev => ({
            ...prev,
            educationList: [...prev.educationList, { school: '', degree: '', year: '' }]
        }));
    };

    const handleEducationChange = (index, field, value) => {
        setProfile(prev => {
            const updated = [...prev.educationList];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, educationList: updated };
        });
    };

    const handleRemoveEducation = (index) => {
        setProfile(prev => ({
            ...prev,
            educationList: prev.educationList.filter((_, i) => i !== index)
        }));
    };

    // --- Dynamic Work Experience Collection Item Manipulation ---
    const handleAddExperience = () => {
        setProfile(prev => ({
            ...prev,
            experienceList: [...prev.experienceList, { company: '', role: '', duration: '' }]
        }));
    };

    const handleExperienceChange = (index, field, value) => {
        setProfile(prev => {
            const updated = [...prev.experienceList];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, experienceList: updated };
        });
    };

    const handleRemoveExperience = (index) => {
        setProfile(prev => ({
            ...prev,
            experienceList: prev.experienceList.filter((_, i) => i !== index)
        }));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

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
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {
            setError('An error occurred while saving profile metrics data.');
        }
    };

    if (loading) return <div className="text-center py-20 font-medium text-slate-600">Loading your profile workspace...</div>;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Professional Profile</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage the identity metrics displayed to recruiters during application cycles.</p>
                </div>

                {message && <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold rounded-xl mb-6">{message}</div>}
                {error && <div className="p-4 bg-red-50 border border-red-200 text-red-600 font-semibold rounded-xl mb-6">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6 text-sm font-bold text-slate-700">

                    {/* --- SECTION 1: CORE METRICS BIOGRAPHY --- */}
                    <div className="border-b border-slate-100 pb-5 space-y-4">
                        <h2 className="text-base font-black text-slate-800 tracking-tight">1. Core Information</h2>
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
                    </div>

                    {/* --- SECTION 2: DYNAMIC SKILLS BUILDER --- */}
                    <div className="border-b border-slate-100 pb-5">
                        <h2 className="text-base font-black text-slate-800 tracking-tight mb-3">2. Core Skills</h2>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={skillInput}
                                onChange={e => setSkillInput(e.target.value)}
                                placeholder="e.g., Java, React, Docker"
                                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill(e))}
                            />
                            <button type="button" onClick={handleAddSkill} className="bg-slate-900 text-white font-bold text-xs px-4 rounded-xl hover:bg-slate-800 transition">Add</button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {profile.skills.length === 0 && <span className="text-xs text-slate-400 font-medium italic">No skills cataloged yet.</span>}
                            {profile.skills.map(skill => (
                                <span key={skill} className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-xs font-bold pl-3 pr-1.5 py-1 rounded-xl border border-slate-200/50">
                                    {skill}
                                    <button type="button" onClick={() => handleRemoveSkill(skill)} className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-slate-200 font-black text-slate-400 hover:text-slate-600 text-[10px]">✕</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* --- SECTION 3: EDUCATION TIMELINE LEDGER --- */}
                    <div className="border-b border-slate-100 pb-5 space-y-3">
                        <div className="flex justify-between items-center">
                            <h2 className="text-base font-black text-slate-800 tracking-tight">3. Education Background</h2>
                            <button type="button" onClick={handleAddEducation} className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition">+ Add School</button>
                        </div>
                        {profile.educationList.length === 0 && <p className="text-xs text-slate-400 font-medium italic pt-1">No education entries logged.</p>}
                        <div className="space-y-3">
                            {profile.educationList.map((edu, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 relative pt-8 sm:pt-4">
                                    <button type="button" onClick={() => handleRemoveEducation(idx)} className="absolute top-2 right-2 text-xs font-bold text-slate-400 hover:text-red-500 transition">Remove</button>
                                    <div>
                                        <label className="block text-[11px] text-slate-400 uppercase mb-1">Institution / School</label>
                                        <input type="text" value={edu.school} onChange={e => handleEducationChange(idx, 'school', e.target.value)} placeholder="University of Hyderabad" className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-lg outline-none bg-white focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] text-slate-400 uppercase mb-1">Degree / Course</label>
                                        <input type="text" value={edu.degree} onChange={e => handleEducationChange(idx, 'degree', e.target.value)} placeholder="B.Tech Computer Science" className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-lg outline-none bg-white focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] text-slate-400 uppercase mb-1">Graduation Year</label>
                                        <input type="text" value={edu.year} onChange={e => handleEducationChange(idx, 'year', e.target.value)} placeholder="2026" className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-lg outline-none bg-white focus:border-blue-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- SECTION 4: PROFESSIONAL WORK EXPERIENCE --- */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <h2 className="text-base font-black text-slate-800 tracking-tight">4. Work Experience</h2>
                            <button type="button" onClick={handleAddExperience} className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition">+ Add Position</button>
                        </div>
                        {profile.experienceList.length === 0 && <p className="text-xs text-slate-400 font-medium italic pt-1">No formal work history logged.</p>}
                        <div className="space-y-3">
                            {profile.experienceList.map((exp, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 relative pt-8 sm:pt-4">
                                    <button type="button" onClick={() => handleRemoveExperience(idx)} className="absolute top-2 right-2 text-xs font-bold text-slate-400 hover:text-red-500 transition">Remove</button>
                                    <div>
                                        <label className="block text-[11px] text-slate-400 uppercase mb-1">Company Name</label>
                                        <input type="text" value={exp.company} onChange={e => handleExperienceChange(idx, 'company', e.target.value)} placeholder="IT Solutions Corp" className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-lg outline-none bg-white focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] text-slate-400 uppercase mb-1">Job Role / Designation</label>
                                        <input type="text" value={exp.role} onChange={e => handleExperienceChange(idx, 'role', e.target.value)} placeholder="Software Engineer Intern" className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-lg outline-none bg-white focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] text-slate-400 uppercase mb-1">Duration (e.g., 6 Months)</label>
                                        <input type="text" value={exp.duration} onChange={e => handleExperienceChange(idx, 'duration', e.target.value)} placeholder="Jan 2026 - Present" className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-lg outline-none bg-white focus:border-blue-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-md shadow-blue-100">
                        Save Structural Changes
                    </button>
                </form>
            </div>
        </div>
    );
}