import React from 'react';
import { Link } from 'react-router-dom';
import { PriorityBadge, StatusBadge, SummaryStatusBadge } from './Badge';

export default function IssueCard({ issue }) {
    return (
        <Link
            to={`/issues/${issue.id}`}
            className="block bg-white rounded-xl border border-gray-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-200 p-5 group"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        {issue.needs_attention && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-600 text-white">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                </svg>
                                Needs attention
                            </span>
                        )}
                        <PriorityBadge priority={issue.priority} />
                        <StatusBadge status={issue.status} />
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            {issue.category}
                        </span>
                    </div>

                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {issue.title}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {issue.description}
                    </p>
                </div>

                <svg className="w-5 h-5 text-gray-300 group-hover:text-blue-400 shrink-0 mt-0.5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>

            <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        {issue.comments_count ?? 0}
                    </span>
                    <span>#{issue.id}</span>
                    <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                </div>
                <SummaryStatusBadge status={issue.summary_status} />
            </div>
        </Link>
    );
}
