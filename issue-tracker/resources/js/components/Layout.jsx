import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            {/* Top nav */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-14 sm:h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2.5 shrink-0">
                            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-200 select-none">
                                IT
                            </span>
                            <span className="text-base font-semibold text-slate-800 hidden sm:block tracking-tight">
                                Issue Tracker
                            </span>
                        </Link>

                        {/* Right side actions */}
                        <div className="flex items-center gap-2">
                            {!isHome && (
                                <Link
                                    to="/"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    <span className="hidden sm:inline">All Issues</span>
                                    <span className="sm:hidden">Back</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main content */}
            <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white mt-auto">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-indigo-700 text-white text-[9px] font-bold">IT</span>
                    <p className="text-xs text-slate-400">
                        Issue Tracker · Smart Summary System
                    </p>
                </div>
            </footer>
        </div>
    );
}
