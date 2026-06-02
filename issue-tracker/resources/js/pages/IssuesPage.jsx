import React, { useState, useEffect, useCallback } from 'react';
import { issues as issuesApi } from '../api/client';
import IssueCard from '../components/IssueCard';
import IssueFilters from '../components/IssueFilters';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import IssueForm from '../components/IssueForm';

export default function IssuesPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ page: 1 });
    const [showCreate, setShowCreate] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await issuesApi.list(filters);
            setData(res.data);
        } catch {
            setError('Failed to load issues. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => { load(); }, [load]);

    const handleCreated = () => {
        setShowCreate(false);
        load();
    };

    const issues = data?.data ?? [];
    const meta = data?.meta ?? {};

    return (
        <div>
            {/* Page header */}
            <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Issues</h1>
                    {meta.total != null && (
                        <p className="text-sm text-slate-500 mt-1">
                            {meta.total} issue{meta.total !== 1 ? 's' : ''}
                            {(filters.status || filters.priority || filters.category || filters.needs_attention) && ' Â· filtered'}
                        </p>
                    )}
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all active:scale-95 shrink-0"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">New Issue</span>
                    <span className="sm:hidden">New</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-5">
                <IssueFilters filters={filters} onChange={setFilters} />
            </div>

            {/* Content */}
            {loading && <LoadingSpinner />}

            {!loading && error && (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                    <svg className="w-10 h-10 text-red-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-sm font-medium text-slate-700">{error}</p>
                    <button onClick={load} className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                        Try again
                    </button>
                </div>
            )}

            {!loading && !error && issues.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <p className="text-base font-semibold text-slate-700">No issues found</p>
                    <p className="text-sm text-slate-400 mt-1">Try adjusting your filters or create a new issue.</p>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        Create first issue
                    </button>
                </div>
            )}

            {!loading && !error && issues.length > 0 && (
                <>
                    <div className="flex flex-col gap-3">
                        {issues.map((issue) => (
                            <IssueCard key={issue.id} issue={issue} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {meta.last_page > 1 && (
                        <div className="flex items-center justify-center gap-1.5 mt-8">
                            <button
                                disabled={meta.current_page === 1}
                                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                                className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                <span className="hidden sm:inline">Prev</span>
                            </button>

                            {/* Page numbers */}
                            <div className="flex items-center gap-1">
                                {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                                    .filter((p) => p === 1 || p === meta.last_page || Math.abs(p - meta.current_page) <= 1)
                                    .reduce((acc, p, idx, arr) => {
                                        if (idx > 0 && arr[idx - 1] !== p - 1) acc.push('â€¦');
                                        acc.push(p);
                                        return acc;
                                    }, [])
                                    .map((item, idx) =>
                                        item === 'â€¦' ? (
                                            <span key={`ellipsis-${idx}`} className="px-1 text-sm text-slate-400">â€¦</span>
                                        ) : (
                                            <button
                                                key={item}
                                                onClick={() => setFilters((f) => ({ ...f, page: item }))}
                                                className={`w-9 h-9 text-sm font-medium rounded-xl transition ${
                                                    item === meta.current_page
                                                        ? 'bg-indigo-600 text-white shadow-sm'
                                                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                                                }`}
                                            >
                                                {item}
                                            </button>
                                        )
                                    )}
                            </div>

                            <button
                                disabled={meta.current_page === meta.last_page}
                                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                                className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                <span className="hidden sm:inline">Next</span>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Create modal */}
            <Modal open={showCreate} title="Create New Issue" onClose={() => setShowCreate(false)}>
                <IssueForm onCreated={handleCreated} onCancel={() => setShowCreate(false)} />
            </Modal>
        </div>
    );
}
