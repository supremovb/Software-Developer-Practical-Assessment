import React from 'react';

const CATEGORIES = ['billing', 'auth', 'performance', 'bug', 'feature', 'deployment', 'data', 'security'];

const SELECT_BASE = 'block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';

export default function IssueFilters({ filters, onChange }) {
    const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value, page: 1 });

    return (
        <div className="flex flex-wrap gap-3 items-center">
            {/* Status */}
            <select value={filters.status ?? ''} onChange={set('status')} className={SELECT_BASE}>
                <option value="">All statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In progress</option>
                <option value="resolved">Resolved</option>
            </select>

            {/* Priority */}
            <select value={filters.priority ?? ''} onChange={set('priority')} className={SELECT_BASE}>
                <option value="">All priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
            </select>

            {/* Category */}
            <select value={filters.category ?? ''} onChange={set('category')} className={SELECT_BASE}>
                <option value="">All categories</option>
                {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                ))}
            </select>

            {/* Needs attention toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                    type="checkbox"
                    checked={!!filters.needs_attention}
                    onChange={(e) => onChange({ ...filters, needs_attention: e.target.checked ? '1' : '', page: 1 })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 whitespace-nowrap">Needs attention</span>
            </label>

            {/* Clear filters */}
            {(filters.status || filters.priority || filters.category || filters.needs_attention) && (
                <button
                    onClick={() => onChange({ page: 1 })}
                    className="text-xs text-blue-600 hover:underline"
                >
                    Clear filters
                </button>
            )}
        </div>
    );
}
