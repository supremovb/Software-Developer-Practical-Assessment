import React from 'react';

const PRIORITY_STYLES = {
    high:   'bg-red-100 text-red-700 ring-1 ring-red-200',
    medium: 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200',
    low:    'bg-green-100 text-green-700 ring-1 ring-green-200',
};

const STATUS_STYLES = {
    open:        'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
    in_progress: 'bg-purple-100 text-purple-700 ring-1 ring-purple-200',
    resolved:    'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
};

const SUMMARY_STYLES = {
    pending: 'bg-orange-100 text-orange-600',
    ready:   'bg-emerald-100 text-emerald-700',
    failed:  'bg-red-100 text-red-600',
};

export function PriorityBadge({ priority }) {
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_STYLES[priority] ?? ''}`}>
            {priority}
        </span>
    );
}

export function StatusBadge({ status }) {
    const label = status?.replace('_', ' ');
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status] ?? ''}`}>
            {label}
        </span>
    );
}

export function SummaryStatusBadge({ status }) {
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${SUMMARY_STYLES[status] ?? ''}`}>
            {status === 'pending' && (
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            )}
            {status}
        </span>
    );
}
