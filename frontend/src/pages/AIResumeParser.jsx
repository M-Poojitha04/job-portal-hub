import { useState } from 'react';

export default function AIResumeParser() {
    const [resumeText, setResumeText] = useState('');
    const [loading, setLoading] = useState(false);
    const [parsedData, setParsedData] = useState(null);

    const handleTextParse = async (e) => {
        e.preventDefault();
        if (!resumeText.trim()) return;

        setLoading(true);
        setParsedData(null);

        try {
            const response = await fetch('http://localhost:8080/api/v1/ai/parse-resume', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Pass your active session token header rule
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ resumeText })
            });

            if (response.ok) {
                const data = await response.json();
                setParsedData(data);
            } else {
                alert("Failed to parse resume credentials context.");
            }
        } catch (error) {
            console.error("AI system network loop failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 min-h-screen bg-slate-50">
            <div className="flex flex-col mb-8">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Module 4 Feature Suite</span>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">Gemini AI Resume Parsing Hub</h1>
                <p className="text-sm text-slate-500 mt-1">Paste unstructured resume text data sheet blocks to generate schemas instantly.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Panel Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3">📋 Raw Profile Input</h3>
                    <form onSubmit={handleTextParse} className="flex flex-col flex-grow gap-4">
                        <textarea
                            className="w-full flex-grow min-h-[350px] p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 leading-relaxed"
                            placeholder="Paste unformatted text directly out of your PDF or Word resume here..."
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={loading || !resumeText.trim()}
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
                        >
                            {loading ? '🤖 AI Engine Parsing Dataset...' : '⚡ Extract Structured Schema'}
                        </button>
                    </form>
                </div>

                {/* Output Metrics Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-[450px]">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3">✨ Structured Data Engine Result</h3>

                    {!loading && !parsedData && (
                        <div className="flex flex-col items-center justify-center flex-grow text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <span className="text-3xl mb-2">🤖</span>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Awaiting Execution Sequence</p>
                        </div>
                    )}

                    {loading && (
                        <div className="flex flex-col items-center justify-center flex-grow gap-2">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-2 animate-pulse">Consulting Gemini Flash...</p>
                        </div>
                    )}

                    {parsedData && (
                        <div className="flex flex-col gap-5 flex-grow overflow-y-auto max-h-[500px] pr-1">
                            {/* Skills Block */}
                            <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">🛠️ Extracted Skills</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {parsedData.skills?.map((skill, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-md text-[11px] border border-blue-100">{skill}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Education List */}
                            <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">🎓 Education Telemetry</h4>
                                <div className="flex flex-col gap-2">
                                    {parsedData.education?.map((edu, i) => (
                                        <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                                            <p className="font-black text-slate-800">{edu.institution}</p>
                                            <p className="text-slate-500 font-medium mt-0.5">{edu.degree} in {edu.fieldOfStudy} ({edu.graduationYear})</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Experience Timeline */}
                            <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">💼 Professional Timeline</h4>
                                <div className="flex flex-col gap-2">
                                    {parsedData.experience?.map((exp, i) => (
                                        <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex flex-col gap-1">
                                            <div className="flex justify-between items-start">
                                                <span className="font-black text-slate-800">{exp.company}</span>
                                                <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-full font-bold text-slate-600 uppercase">{exp.duration}</span>
                                            </div>
                                            <p className="font-bold text-blue-600 text-[11px]">{exp.role}</p>
                                            <p className="text-slate-500 font-medium leading-normal mt-0.5">{exp.summary}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}