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

    const handleCreated = (newIssue) => {
        setShowCreate(false);
        load();
    };

    const issues = data?.data ?? [];
    const meta = data?.meta ?? {};

    return (
        <div>
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Issues</h1>
                    {meta.total != null && (
                        <p className="text-sm text-gray-500 mt-0.5">
                            {meta.total} issue{meta.total !== 1 ? 's' : ''} total
                        </p>
                    )}
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Issue
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-4 mb-5">
                <IssueFilters filters={filters} onChange={setFilters} />
            </div>

            {/* Content */}
            {loading && <LoadingSpinner />}

            {!loading && error && (
                <div className="text-center py-12">
                    <p className="text-red-500 text-sm">{error}</p>
                    <button onClick={load} className="mt-3 text-sm text-blue-600 hover:underline">Retry</button>
                </div>
            )}

            {!loading && !error && issues.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-sm font-medium">No issues found</p>
                    <p className="text-xs mt-1">Try adjusting your filters or create a new issue.</p>
                </div>
            )}

            {!loading && !error && issues.length > 0 && (
                <>
                    <div className="grid gap-3">
                        {issues.map((issue) => (
                            <IssueCard key={issue.id} issue={issue} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {meta.last_page > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <button
                                disabled={meta.current_page === 1}
                                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                ← Prev
                            </button>
                            <span className="text-sm text-gray-500">
                                Page {meta.current_page} of {meta.last_page}
                            </span>
                            <button
                                disabled={meta.current_page === meta.last_page}
                                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                Next →
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
