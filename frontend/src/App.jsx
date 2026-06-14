import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import JobSearch from './pages/JobSearch';
import PostJob from './pages/PostJob';
import RecruiterDashboard from './pages/RecruiterDashboard';
import CandidateApplications from './pages/CandidateApplications'; // Import new candidate view
import ReviewApplicants from './pages/ReviewApplicants';
import EditProfile from './pages/EditProfile';
import EditJob from './pages/EditJob';

function Home() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="text-2xl font-black tracking-tight text-blue-600">
                            Job<span className="text-slate-800">Portal</span>
                        </Link>
                        <Link to="/browse" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition">
                            Browse Jobs
                        </Link>
                        {user && user.role === 'RECRUITER' && (
                            <Link to="/dashboard" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition">
                                Dashboard
                            </Link>
                        )}
                        {user && user.role === 'JOB_SEEKER' && (
                            <Link to="/my-applications" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition">
                                My Applications
                            </Link>
                        )}
                        {user && (
                            <Link to="/profile" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition">
                                My Profile
                            </Link>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                {user.role === 'RECRUITER' && (
                                    <Link to="/post-job" className="text-sm font-bold bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition">
                                        + Post Job
                                    </Link>
                                )}
                                <span className="text-sm font-semibold text-slate-500">Hello, {user.email}</span>
                                <button onClick={logout} className="text-sm font-semibold text-red-600 hover:text-red-800 transition">
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition">Sign In</Link>
                                <Link to="/register" className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition">Join Now</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <header className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
                    Find the next step in your <br />
                    <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            professional journey.
          </span>
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
                    Discover curated positions, build role-separated portals, and manage your applications seamlessly.
                </p>
                <div className="flex justify-center gap-4">
                    <Link to="/browse" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl transition shadow-lg shadow-blue-100">
                        Explore Browse Feed
                    </Link>
                    {user && user.role === 'JOB_SEEKER' && (
                        <Link to="/my-applications" className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-8 py-3.5 rounded-xl transition">
                            View My Applications
                        </Link>
                    )}
                </div>
            </header>
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/browse" element={<JobSearch />} />
                    <Route path="/post-job" element={<PostJob />} />
                    <Route path="/dashboard" element={<RecruiterDashboard />} />
                    <Route path="/my-applications" element={<CandidateApplications />} /> {/* Registered New History Route */}
                    <Route path="/review-applicants/:jobId" element={<ReviewApplicants />} />
                    <Route path="/profile" element={<EditProfile />} />
                    <Route path="/edit-job/:jobId" element={<EditJob />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}