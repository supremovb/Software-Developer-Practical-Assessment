import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Top nav */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-2.5">
                            {/* Bug/ticket icon */}
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white text-sm font-bold">
                                IT
                            </span>
                            <span className="text-lg font-semibold text-gray-900 hidden sm:block">
                                Issue Tracker
                            </span>
                        </Link>

                        <div className="flex items-center gap-3">
                            {location.pathname !== '/' && (
                                <Link
                                    to="/"
                                    className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    All Issues
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 bg-white mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <p className="text-xs text-gray-400 text-center">
                        Issue Tracker — Smart Summary System
                    </p>
                </div>
            </footer>
        </div>
    );
}
