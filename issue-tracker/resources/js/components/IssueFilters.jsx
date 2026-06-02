import React from 'react';

const CATEGORIES = ['billing', 'auth', 'performance', 'bug', 'feature', 'deployment', 'data', 'security'];

const SELECT = 'block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition appearance-none cursor-pointer';

export default function IssueFilters({ filters, onChange }) {
    const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value, page: 1 });
    const hasFilters = filters.status || filters.priority || filters.category || filters.needs_attention;

    return (
        <div className="space-y-3">
            {/* Filter label row */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                    </svg>
                    Filters
                </span>
                {hasFilters && (
                    <button
                        onClick={() => onChange({ page: 1 })}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                        Clear all
                    </button>
                )}
            </div>

            {/* Filter controls — 2-col on mobile, 4-col on sm+ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Status */}
                <div className="relative">
                    <select value={filters.status ?? ''} onChange={set('status')} className={SELECT}>
                        <option value="">All statuses</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In progress</option>
                        <option value="resolved">Resolved</option>
                    </select>
                    <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                {/* Priority */}
                <div className="relative">
                    <select value={filters.priority ?? ''} onChange={set('priority')} className={SELECT}>
                        <option value="">All priorities</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                    <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                {/* Category */}
                <div className="relative">
                    <select value={filters.category ?? ''} onChange={set('category')} className={SELECT}>
                        <option value="">All categories</option>
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c} className="capitalize">{c}</option>
                        ))}
                    </select>
                    <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                {/* Needs attention toggle */}
                <label className={`flex items-center gap-2.5 cursor-pointer select-none rounded-xl border px-3 py-2.5 transition-colors ${filters.needs_attention ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}>
                    <input
                        type="checkbox"
                        checked={!!filters.needs_attention}
                        onChange={(e) => onChange({ ...filters, needs_attention: e.target.checked ? '1' : '', page: 1 })}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
                    />
                    <span className="text-sm text-slate-700 font-medium whitespace-nowrap">
                        Needs attention
                    </span>
                </label>
            </div>
        </div>
    );
}
