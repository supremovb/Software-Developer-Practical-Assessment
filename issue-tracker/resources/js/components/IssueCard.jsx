import React from 'react';
import { Link } from 'react-router-dom';
import { PriorityBadge, StatusBadge, SummaryStatusBadge } from './Badge';

const PRIORITY_BAR = {
    high:   'bg-red-500',
    medium: 'bg-amber-400',
    low:    'bg-emerald-500',
};

export default function IssueCard({ issue }) {
    return (
        <Link
            to={`/issues/${issue.id}`}
            className="group flex bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 overflow-hidden"
        >
            {/* Priority color bar */}
            <span className={`w-1 shrink-0 ${PRIORITY_BAR[issue.priority] ?? 'bg-slate-200'}`} />

            <div className="flex-1 min-w-0 p-4 sm:p-5">
                {/* Top row: badges */}
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                    {issue.needs_attention && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-600 text-white">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            Attention
                        </span>
                    )}
                    <PriorityBadge priority={issue.priority} />
                    <StatusBadge status={issue.status} />
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 capitalize">
                        {issue.category}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-1">
                    {issue.title}
                </h3>

                {/* Description preview */}
                <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {issue.description}
                </p>

                {/* Bottom row: meta */}
                <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            {issue.comments_count ?? 0}
                        </span>
                        <span className="font-mono">#{issue.id}</span>
                        <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <SummaryStatusBadge status={issue.summary_status} />
                        <svg className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
}
