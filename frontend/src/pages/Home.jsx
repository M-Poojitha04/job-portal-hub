import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // States for interactive UI elements
    const [showResources, setShowResources] = useState(false);
    const [mockFilter, setMockFilter] = useState('for-you'); // 'for-you', 'recent', 'popular'

    // Static mock data rows for the interactive widget
    const allMockJobs = {
        'for-you': [
            { title: 'Product Designer', company: 'Acme Inc.', loc: 'Remote', bg: 'bg-blue-500', char: 'A', type: 'Full-time', cat: 'Design' },
            { title: 'Senior Software Engineer', company: 'Sparkle Labs', loc: 'San Francisco, CA', bg: 'bg-indigo-500', char: 'S', type: 'Full-time', cat: 'Engineering' },
            { title: 'Growth Marketing Manager', company: 'Greenify', loc: 'New York, NY', bg: 'bg-emerald-500', char: 'G', type: 'Full-time', cat: 'Marketing' }
        ],
        'recent': [
            { title: 'Full Stack Developer', company: 'DevFlow', loc: 'Remote', bg: 'bg-orange-500', char: 'D', type: 'Full-time', cat: 'Engineering' },
            { title: 'UI/UX Researcher', company: 'Acme Inc.', loc: 'Austin, TX', bg: 'bg-blue-500', char: 'A', type: 'Contract', cat: 'Design' }
        ],
        'popular': [
            { title: 'AI Prompt Engineer', company: 'Nexus AI', loc: 'Remote', bg: 'bg-purple-600', char: 'N', type: 'Full-time', cat: 'AI/ML' },
            { title: 'Data Scientist', company: 'QuantCorp', loc: 'Chicago, IL', bg: 'bg-cyan-600', char: 'Q', type: 'Full-time', cat: 'Analytics' }
        ]
    };

    const handleBrowseClick = () => {
        if (!user) {
            // Redirect public guests to login page with a helpful message redirect state
            navigate('/login', { state: { message: 'Please sign in to browse and search active opportunities!' } });
        } else {
            navigate('/browse');
        }
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 overflow-x-hidden">

            {/* --- 1. PREMIUM NAVIGATION BAR --- */}
            <nav className="w-full border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 lg:px-16 py-4 flex items-center justify-between">
                <div className="flex items-center gap-10">
                    <Link to="/" className="text-2xl font-black tracking-tight text-blue-600 flex items-center gap-1">
                        Job<span className="text-slate-900">Portal</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                        <button onClick={handleBrowseClick} className="hover:text-blue-600 transition font-semibold">Browse Jobs</button>
                        <a href="#companies" className="hover:text-blue-600 transition">Companies</a>
                        <a href="#features" className="hover:text-blue-600 transition">Features</a>

                        {/* Interactive Resources Dropdown Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowResources(!showResources)}
                                onBlur={() => setTimeout(() => setShowResources(false), 200)}
                                className="flex items-center gap-1 hover:text-blue-600 transition font-semibold focus:outline-none"
                            >
                                Resources <span className="text-[10px]">{showResources ? '▲' : '▼'}</span>
                            </button>
                            {showResources && (
                                <div className="absolute left-0 mt-3 w-48 bg-white border border-slate-100 rounded-xl shadow-xl py-2 z-50 text-left animate-fade-in">
                                    <Link to="/ai-parser" className="block px-4 py-2 hover:bg-slate-50 text-xs font-bold text-slate-700 hover:text-blue-600">⚡ AI Resume Parser</Link>
                                    <a href="#features" className="block px-4 py-2 hover:bg-slate-50 text-xs font-bold text-slate-700 hover:text-blue-600">User Documentation</a>
                                    <div className="border-t border-slate-50 my-1"></div>
                                    <span className="block px-4 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">System Version 1.0</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-sm font-bold">
                    {user ? (
                        <>
                            <Link to={user.role === 'RECRUITER' ? "/dashboard" : "/browse"} className="text-slate-700 hover:text-blue-600 transition px-3 py-2">
                                Go to Dashboard
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-slate-700 hover:text-blue-600 transition px-3 py-2">Sign In</Link>
                            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition shadow-sm shadow-blue-100">
                                Join Now
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* --- 2. HERO LAYER SECTION --- */}
            <header className="relative max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-blue-100/40 to-purple-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />

                {/* Left Content Column */}
                <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full border border-blue-100 shadow-sm">
                        ✨ Your next opportunity is waiting
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
                        Find the next step in your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">professional journey.</span>
                    </h1>
                    <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto lg:mx-0">
                        Discover curated positions, build role-separated portals, and manage your applications seamlessly — all in one place.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                        <button onClick={handleBrowseClick} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl transition shadow-lg shadow-blue-100 text-center flex items-center justify-center gap-2 group">
                            Explore Browse Feed <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                        <Link to={user ? (user.role === 'RECRUITER' ? "/dashboard" : "/browse") : "/login"} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold px-8 py-4 rounded-xl transition shadow-sm text-center">
                            Create a Job Portal
                        </Link>
                    </div>

                    <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-xs font-bold text-slate-400 pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">🛡️ Verified Employers</div>
                        <div className="flex items-center gap-1.5">⭐ Curated Opportunities</div>
                        <div className="flex items-center gap-1.5">🔒 Secure & Private</div>
                    </div>
                </div>

                {/* Right Interactive Component Layout Box */}
                <div className="lg:col-span-6 relative flex flex-col md:flex-row items-center gap-6 justify-center">

                    {/* Opportunities Widget Container */}
                    <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 p-5 space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                            <h3 className="font-black text-slate-800 text-sm">Featured Opportunities</h3>
                            <button onClick={handleBrowseClick} className="text-blue-600 text-xs font-extrabold hover:underline">View all jobs ↗</button>
                        </div>

                        {/* Working Filter Tabs */}
                        <div className="flex gap-4 text-xs font-bold text-slate-400 border-b border-slate-100 pb-2">
                            <button onClick={() => setMockFilter('for-you')} className={`pb-2 focus:outline-none transition ${mockFilter === 'for-you' ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-slate-600'}`}>For You</button>
                            <button onClick={() => setMockFilter('recent')} className={`pb-2 focus:outline-none transition ${mockFilter === 'recent' ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-slate-600'}`}>Recent</button>
                            <button onClick={() => setMockFilter('popular')} className={`pb-2 focus:outline-none transition ${mockFilter === 'popular' ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-slate-600'}`}>Popular</button>
                        </div>

                        {/* Dynamic Job Item Swapping Output Grid */}
                        <div className="space-y-3 pt-1 min-h-[190px]">
                            {allMockJobs[mockFilter].map((job, idx) => (
                                <div key={idx} className="flex justify-between items-center p-2 hover:bg-slate-50/80 rounded-xl transition border border-transparent border-slate-100/40">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 ${job.bg} text-white font-black rounded-lg flex items-center justify-center text-sm`}>{job.char}</div>
                                        <div className="text-left">
                                            <div className="font-bold text-slate-900 text-xs">{job.title}</div>
                                            <div className="text-[11px] text-slate-400 font-medium mt-0.5">{job.company} • {job.loc}</div>
                                            <div className="flex gap-1.5 mt-1.5">
                                                <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded">{job.type}</span>
                                                <span className="bg-blue-50 text-blue-600 text-[9px] font-bold px-2 py-0.5 rounded">{job.cat}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span onClick={handleBrowseClick} className="text-slate-300 hover:text-blue-500 cursor-pointer text-sm transition">🔖</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Widgets */}
                    <div className="flex flex-col gap-4 w-full max-w-[200px]">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 p-4 text-center">
                            <div className="w-12 h-12 bg-slate-100 rounded-full mx-auto overflow-hidden border-2 border-white shadow-sm">
                                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120" alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                            <h4 className="font-bold text-slate-800 text-xs mt-3">Welcome back, Olivia 👋</h4>
                            <div className="mt-4 pt-3 border-t border-slate-50 text-left space-y-2">
                                <div className="flex justify-between text-[11px] font-semibold"><span className="text-slate-400">Applications</span> <span className="text-slate-800 font-bold">12</span></div>
                                <div className="flex justify-between text-[11px] font-semibold"><span className="text-slate-400">Saved Jobs</span> <span className="text-slate-800 font-bold">8</span></div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 p-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-left">Application Progress</span>
                            <div className="flex items-center gap-3 mt-3">
                                <div className="relative w-11 h-11 flex items-center justify-center rounded-full bg-blue-50 border-4 border-blue-500 border-r-transparent">
                                    <span className="text-[10px] font-black text-blue-600">75%</span>
                                </div>
                                <div className="text-left">
                                    <div className="text-[11px] font-bold text-slate-800">Great progress!</div>
                                    <div className="text-[9px] text-slate-400 font-medium leading-tight">Almost there.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </header>

            {/* --- 3. TRUSTED COMPANIES LOGO BAR --- */}
            <section id="companies" className="w-full bg-slate-50/50 border-y border-slate-100/80 py-10 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-6">Trusted by top companies</span>
                <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-center gap-10 md:gap-16 opacity-40 grayscale">
                    <span className="text-lg font-black tracking-tight text-slate-800">Microsoft</span>
                    <span className="text-lg font-black tracking-tight text-slate-800">Google</span>
                    <span className="text-lg font-black tracking-tight text-slate-800">airbnb</span>
                    <span className="text-lg font-black tracking-tight text-slate-800">Spotify</span>
                    <span className="text-lg font-black tracking-tight text-slate-800">HubSpot</span>
                    <span className="text-lg font-black tracking-tight text-slate-800">slack</span>
                </div>
            </section>

            {/* --- 4. CORE VALUE GRID CARDS --- */}
            <section id="features" className="max-w-6xl mx-auto px-6 py-24 text-center">
                <div className="space-y-3 mb-16">
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">Why JobPortal?</span>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900">Everything you need to advance your career</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { icon: '💼', title: 'Curated Opportunities', desc: 'Handpicked jobs that match your skills, experience, and career goals.' },
                        { icon: '🏢', title: 'Role-Separated Portals', desc: 'Create dedicated portals for different roles and talent validation teams.' },
                        { icon: '🥞', title: 'Seamless Management', desc: 'Track applications, interviews, and updates – all in one unified dashboard.' },
                        { icon: '🛡️', title: 'Secure & Private', desc: 'Your data is protected with enterprise-grade connection security.' }
                    ].map((card, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/60 text-left space-y-4 shadow-sm hover:shadow-md transition">
                            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-xl">{card.icon}</div>
                            <h3 className="font-extrabold text-slate-800 text-base tracking-tight">{card.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium">{card.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}