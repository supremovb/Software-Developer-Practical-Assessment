import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { issues as issuesApi, comments as commentsApi } from '../api/client';
import { PriorityBadge, StatusBadge, SummaryStatusBadge } from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = ['billing', 'auth', 'performance', 'bug', 'feature', 'deployment', 'data', 'security'];
const INPUT = 'block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';

function CommentItem({ comment }) {
    return (
        <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                {comment.author_name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">{comment.author_name}</span>
                    <span className="text-xs text-gray-400">
                        {new Date(comment.created_at).toLocaleString()}
                    </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.body}</p>
            </div>
        </div>
    );
}

function AddCommentForm({ issueId, onAdded }) {
    const [form, setForm] = useState({ author_name: '', body: '' });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSubmitting(true);
        try {
            const res = await commentsApi.create(issueId, form);
            onAdded(res.data.data);
            setForm({ author_name: '', body: '' });
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors ?? {});
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200" noValidate>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Leave a comment</h4>
            <div className="space-y-3">
                <div>
                    <input
                        type="text"
                        placeholder="Your name"
                        value={form.author_name}
                        onChange={(e) => setForm((f) => ({ ...f, author_name: e.target.value }))}
                        className={INPUT}
                    />
                    {errors.author_name && <p className="text-xs text-red-600 mt-1">{errors.author_name[0]}</p>}
                </div>
                <div>
                    <textarea
                        rows={3}
                        placeholder="Write a comment…"
                        value={form.body}
                        onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                        className={INPUT + ' resize-none'}
                    />
                    {errors.body && <p className="text-xs text-red-600 mt-1">{errors.body[0]}</p>}
                </div>
            </div>
            <div className="mt-3 flex justify-end">
                <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition"
                >
                    {submitting ? 'Posting…' : 'Post Comment'}
                </button>
            </div>
        </form>
    );
}

function EditIssuePanel({ issue, onUpdated, onCancel }) {
    const [form, setForm] = useState({
        title: issue.title,
        description: issue.description,
        priority: issue.priority,
        category: issue.category,
        status: issue.status,
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSubmitting(true);
        try {
            const res = await issuesApi.update(issue.id, form);
            onUpdated(res.data.data);
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors ?? {});
            }
        } finally {
            setSubmitting(false);
        }
    };

    const LABEL = 'block text-sm font-medium text-gray-700 mb-1';

    return (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
                <label className={LABEL}>Title</label>
                <input type="text" value={form.title} onChange={set('title')} className={INPUT} />
                {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title[0]}</p>}
            </div>
            <div>
                <label className={LABEL}>Description</label>
                <textarea rows={4} value={form.description} onChange={set('description')} className={INPUT + ' resize-none'} />
                {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description[0]}</p>}
            </div>
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className={LABEL}>Priority</label>
                    <select value={form.priority} onChange={set('priority')} className={INPUT}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <div>
                    <label className={LABEL}>Category</label>
                    <select value={form.category} onChange={set('category')} className={INPUT}>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label className={LABEL}>Status</label>
                    <select value={form.status} onChange={set('status')} className={INPUT}>
                        <option value="open">Open</option>
                        <option value="in_progress">In progress</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                    Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition">
                    {submitting ? 'Saving…' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}

export default function IssueDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await issuesApi.get(id);
            setIssue(res.data.data);
        } catch (err) {
            if (err.response?.status === 404) {
                setError('Issue not found.');
            } else {
                setError('Failed to load issue.');
            }
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const handleCommentAdded = (comment) => {
        setIssue((prev) => ({
            ...prev,
            comments: [...(prev.comments ?? []), comment],
        }));
    };

    const handleUpdated = (updated) => {
        setIssue((prev) => ({ ...prev, ...updated }));
        setEditing(false);
    };

    if (loading) return <LoadingSpinner />;

    if (error) {
        return (
            <div className="text-center py-16">
                <p className="text-red-500 text-sm">{error}</p>
                <button onClick={() => navigate('/')} className="mt-3 text-sm text-blue-600 hover:underline">
                    ← Back to issues
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-sm text-gray-400 mb-5">
                <button onClick={() => navigate('/')} className="hover:text-gray-600 transition">Issues</button>
                <span>/</span>
                <span className="text-gray-600 font-medium truncate max-w-xs">#{issue.id}</span>
            </nav>

            {/* Issue card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Header */}
                <div className={`px-6 py-4 border-b border-gray-100 ${issue.needs_attention ? 'bg-red-50' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            {issue.needs_attention && (
                                <div className="flex items-center gap-1.5 text-red-600 text-xs font-semibold mb-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                    </svg>
                                    NEEDS ATTENTION
                                </div>
                            )}
                            <h1 className="text-xl font-bold text-gray-900">{issue.title}</h1>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <PriorityBadge priority={issue.priority} />
                                <StatusBadge status={issue.status} />
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{issue.category}</span>
                                <span className="text-xs text-gray-400">#{issue.id}</span>
                                <span className="text-xs text-gray-400">{new Date(issue.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setEditing((e) => !e)}
                            className="shrink-0 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                            {editing ? 'Cancel' : 'Edit'}
                        </button>
                    </div>
                </div>

                <div className="px-6 py-5 space-y-6">
                    {editing ? (
                        <EditIssuePanel issue={issue} onUpdated={handleUpdated} onCancel={() => setEditing(false)} />
                    ) : (
                        <>
                            {/* Description */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</h3>
                                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{issue.description}</p>
                            </div>

                            {/* AI Summary */}
                            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-semibold text-blue-800 flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m1.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.405A1 1 0 0113 20H11a1 1 0 01-.764-1.645l-.347-.405z" />
                                        </svg>
                                        Smart Summary
                                    </h3>
                                    <SummaryStatusBadge status={issue.summary_status} />
                                </div>

                                {issue.summary_status === 'ready' && issue.summary ? (
                                    <div className="space-y-2">
                                        <p className="text-sm text-blue-900">{issue.summary}</p>
                                        {issue.suggested_next_action && (
                                            <div className="mt-2 bg-white rounded-lg p-3 border border-blue-200">
                                                <p className="text-xs font-semibold text-blue-700 mb-0.5">Suggested next action</p>
                                                <p className="text-sm text-blue-800">{issue.suggested_next_action}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : issue.summary_status === 'pending' ? (
                                    <p className="text-sm text-blue-600 italic">Summary is being generated in the background…</p>
                                ) : (
                                    <p className="text-sm text-red-500 italic">Summary generation failed. It will be retried automatically.</p>
                                )}
                            </div>
                        </>
                    )}

                    {/* Comments */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                            Comments ({issue.comments?.length ?? 0})
                        </h3>

                        {(!issue.comments || issue.comments.length === 0) ? (
                            <p className="text-sm text-gray-400 text-center py-6 bg-gray-50 rounded-xl border border-gray-100">
                                No comments yet. Be the first to comment.
                            </p>
                        ) : (
                            <div className="space-y-5">
                                {issue.comments.map((comment) => (
                                    <CommentItem key={comment.id} comment={comment} />
                                ))}
                            </div>
                        )}

                        <AddCommentForm issueId={issue.id} onAdded={handleCommentAdded} />
                    </div>
                </div>
            </div>
        </div>
    );
}
