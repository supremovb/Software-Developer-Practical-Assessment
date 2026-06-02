import React from 'react';

const PRIORITY_STYLES = {
    high:   'bg-red-50 text-red-700 ring-1 ring-red-200',
    medium: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    low:    'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
};

const PRIORITY_DOT = {
    high:   'bg-red-500',
    medium: 'bg-amber-500',
    low:    'bg-emerald-500',
};

const STATUS_STYLES = {
    open:        'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    in_progress: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
    resolved:    'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
};

const STATUS_DOT = {
    open:        'bg-blue-500',
    in_progress: 'bg-violet-500',
    resolved:    'bg-slate-400',
};

const STATUS_LABELS = {
    open:        'Open',
    in_progress: 'In Progress',
    resolved:    'Resolved',
};

const SUMMARY_STYLES = {
    pending: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200',
    ready:   'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    failed:  'bg-red-50 text-red-600 ring-1 ring-red-200',
};

const SUMMARY_LABELS = {
    pending: 'Generating…',
    ready:   'AI Ready',
    failed:  'Failed',
};

export function PriorityBadge({ priority }) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_STYLES[priority] ?? ''}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[priority] ?? ''}`} />
            {priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : '—'}
        </span>
    );
}

export function StatusBadge({ status }) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[status] ?? ''}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status] ?? ''}`} />
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}

export function SummaryStatusBadge({ status }) {
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${SUMMARY_STYLES[status] ?? ''}`}>
            {status === 'pending' && (
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            )}
            {status === 'ready' && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
            )}
            {status === 'failed' && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
            )}
            {SUMMARY_LABELS[status] ?? status}
        </span>
    );
}
