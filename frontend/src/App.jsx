import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import axiosInstance from 'axios';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import JobSearch from './pages/JobSearch';
import PostJob from './pages/PostJob';
import RecruiterDashboard from './pages/RecruiterDashboard';
import CandidateApplications from './pages/CandidateApplications';
import ReviewApplicants from './pages/ReviewApplicants';
import EditProfile from './pages/EditProfile';
import EditJob from './pages/EditJob';
import SavedJobs from './pages/SavedJobs';
import ManageCompany from './pages/ManageCompany';
import AdminDashboard from './pages/AdminDashboard';
import ResetPassword from "./pages/ResetPassword.jsx";
import WebSocketNotificationListener from './context/WebSocketNotificationListener';
import AIResumeParser from './pages/AIResumeParser';


// --- CLEANED LAYOUT WRAPPER COMPONENT ---
function MainLayout({ children, unreadNotifications, showDropdown, setShowDropdown, notifications, onClear }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate(); // <-- Hook attached to safely transition window routes

    // If we are on the landing page, completely drop this navbar layout to let the SaaS navbar shine
    if (location.pathname === "/") {
        return <>{children}</>;
    }

    // Interactive Action: Terminate state session and clear protected routing views instantly
    const handleSignOut = () => {
        logout();           // Drops state objects and sweeps browser local storage memory keys
        navigate('/login'); // Instantly forces a redirect back to the central login screen gateway
    };

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

                        {/* Recruiter Navigation Paths */}
                        {user && user.role === 'RECRUITER' && (
                            <>
                                <Link to="/dashboard" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition">
                                    Dashboard
                                </Link>
                                <Link to="/ai-parser" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition">
                                    ✨ AI Parser
                                </Link>
                            </>
                        )}

                        {/* Admin Navigation Paths */}
                        {user && user.role === 'ADMIN' && (
                            <>
                                <Link to="/admin/dashboard" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition">
                                    Admin Dashboard
                                </Link>
                                <Link to="/ai-parser" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition">
                                    ✨ AI Parser
                                </Link>
                            </>
                        )}

                        {/* Candidate Navigation Paths */}
                        {user && user.role === 'JOB_SEEKER' && (
                            <>
                                <Link to="/my-applications" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition">
                                    My Applications
                                </Link>
                                <Link to="/saved-jobs" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition">
                                    ⭐ Saved Jobs
                                </Link>
                            </>
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

                                {/* --- Persisted Global Notification Bell --- */}
                                {user.role === 'JOB_SEEKER' && (
                                    <div className="relative">
                                        <button onClick={() => setShowDropdown(!showDropdown)} className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-50 transition text-lg outline-none">
                                            🔔
                                            {unreadNotifications > 0 && (
                                                <span className="absolute top-0.5 right-0.5 bg-red-500 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                                                    {unreadNotifications}
                                                </span>
                                            )}
                                        </button>

                                        {showDropdown && (
                                            <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 text-xs z-50 block" style={{ minHeight: '50px', top: '100%' }}>
                                                <div className="flex justify-between items-center pb-2 border-b border-slate-100 mb-2 font-bold text-slate-800">
                                                    <span>Status Update Notices</span>
                                                    {unreadNotifications > 0 && (
                                                        <button onClick={onClear} className="text-blue-600 hover:underline">Mark all read</button>
                                                    )}
                                                </div>
                                                <div className="max-h-60 overflow-y-auto space-y-2 font-medium text-slate-600">
                                                    {notifications.length === 0 ? (
                                                        <p className="text-center py-4 text-slate-400">No recent activity notices.</p>
                                                    ) : (
                                                        notifications.map(n => (
                                                            <div key={n.id} className={`p-2.5 rounded-xl border text-left transition ${!n.read ? 'bg-blue-50/50 border-blue-100 text-slate-900 font-semibold' : 'bg-white border-slate-100'}`}>
                                                                <p>{n.message}</p>
                                                                <span className="text-[10px] text-slate-400 block mt-1">{new Date(n.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    {user && user.profilePicUrl ? (
                                        <img
                                            src={user.profilePicUrl}
                                            alt="User Header Icon"
                                            className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 object-cover"
                                        />
                                    ) : (
                                        <span className="text-lg bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center border border-slate-200">👤</span>
                                    )}
                                    <span className="text-sm font-semibold text-slate-600">Hello, {user.email}</span>
                                </div>
                                <button onClick={handleSignOut} className="text-sm font-semibold text-red-600 hover:text-red-800 transition focus:outline-none">
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

            {children}
        </div>
    );
}

// --- CORE APP CONTAINER WITH PERSISTED APP-LEVEL NOTIFICATION ENGINE ---
function AppContent() {
    const { user } = useAuth();
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [notificationsList, setNotificationsList] = useState([]);

    const fetchNotificationMetrics = () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        import('axios').then((rawAxios) => {
            rawAxios.default.get('http://localhost:8080/api/v1/notifications', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    setUnreadNotifications(res.data.unreadCount);
                    setNotificationsList(res.data.notifications);
                })
                .catch((err) => {
                    console.log("Polling for pipeline alerts error:", err.response?.status);
                });
        });
    };

    useEffect(() => {
        if (user && user.role === 'JOB_SEEKER') {
            fetchNotificationMetrics();
            const interval = setInterval(fetchNotificationMetrics, 5000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const clearAllNotifications = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const rawAxios = (await import('axios')).default;
            await rawAxios.put('http://localhost:8080/api/v1/notifications/mark-all-read', {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUnreadNotifications(0);
            setNotificationsList(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <MainLayout
            unreadNotifications={unreadNotifications}
            showDropdown={showDropdown}
            setShowDropdown={setShowDropdown}
            notifications={notificationsList}
            onClear={clearAllNotifications}
        >
            <WebSocketNotificationListener />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/browse" element={<JobSearch />} />
                <Route path="/post-job" element={<PostJob />} />
                <Route path="/dashboard" element={<RecruiterDashboard />} />
                <Route path="/my-applications" element={<CandidateApplications />} />
                <Route path="/review-applicants/:jobId" element={<ReviewApplicants />} />
                <Route path="/profile" element={<EditProfile />} />
                <Route path="/edit-job/:jobId" element={<EditJob />} />
                <Route path="/saved-jobs" element={<SavedJobs />} />
                <Route path="/manage-company" element={<ManageCompany />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/ai-parser" element={<AIResumeParser />} />
            </Routes>
        </MainLayout>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}