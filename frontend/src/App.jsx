import React from 'react';

export default function App() {
  return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        {/* Simple Navigation Bar */}
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="text-2xl font-black tracking-tight text-blue-600">
              Job<span className="text-slate-800">Portal</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition">
                Sign In
              </button>
              <button className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition">
                Post a Job
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            Find the next step in your <br />
            <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            professional journey.
          </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            Discover thousands of curated opportunities for developer, design, and product roles with seamless application tracking.
          </p>

          {/* Search Bar */}
          <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-200/80 max-w-3xl mx-auto flex flex-col md:flex-row gap-2">
            <input
                type="text"
                placeholder="Job title, keywords, or company..."
                className="flex-1 px-4 py-3 bg-transparent outline-none border-b md:border-b-0 md:border-r border-slate-200 focus:placeholder-slate-400"
            />
            <input
                type="text"
                placeholder="City, state, or remote..."
                className="flex-1 px-4 py-3 bg-transparent outline-none focus:placeholder-slate-400"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition shadow-md whitespace-nowrap">
              Search Jobs
            </button>
          </div>
        </header>
      </div>
  );
}