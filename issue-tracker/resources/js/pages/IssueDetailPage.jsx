import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { issues as issuesApi, comments as commentsApi } from '../api/client';
import { PriorityBadge, StatusBadge, SummaryStatusBadge } from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = ['billing', 'auth', 'performance', 'bug', 'feature', 'deployment', 'data', 'security'];
const INPUT = 'block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white';

function CommentItem({ comment }) {
    const initials = comment.author_name?.slice(0, 2).toUpperCase() ?? '?';
    const colors = ['bg-indigo-100 text-indigo-600', 'bg-violet-100 text-violet-600', 'bg-pink-100 text-pink-600', 'bg-teal-100 text-teal-600'];
    const color = colors[(comment.author_name?.charCodeAt(0) ?? 0) % colors.length];

    return (
        <div className="flex gap-3">
            <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${color}`}>
                {initials}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-slate-800">{comment.author_name}</span>
                    <span className="text-xs text-slate-400">
                        {new Date(comment.created_at).toLocaleString()}
                    </span>
                </div>
                <div className="bg-slate-50 rounded-xl px-3.5 py-3 border border-slate-100">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{comment.body}</p>
                </div>
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
        <form onSubmit={handleSubmit} className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4" noValidate>
            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Leave a comment
            </h4>
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
                        placeholder="Write a commentâ€¦"
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
                    className="px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition shadow-sm shadow-indigo-200 active:scale-95"
                >
                    {submitting ? 'Postingâ€¦' : 'Post Comment'}
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

    const LABEL = 'block text-sm font-semibold text-slate-700 mb-1.5';

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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-1">
                <button type="button" onClick={onCancel} className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition w-full sm:w-auto">
                    Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition shadow-sm shadow-indigo-200 active:scale-95 w-full sm:w-auto">
                    {submitting ? 'Savingâ€¦' : 'Save Changes'}
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
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-slate-700">{error}</p>
                <button onClick={() => navigate('/')} className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                    â† Back to issues
                </button>
            </div>
        );
    }

    const PRIORITY_HEADER_BG = {
        high:   'bg-red-50 border-red-100',
        medium: 'bg-amber-50 border-amber-100',
        low:    'bg-emerald-50 border-emerald-100',
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-5">
                <button onClick={() => navigate('/')} className="hover:text-slate-600 transition font-medium">Issues</button>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-slate-600 font-medium truncate max-w-[200px] sm:max-w-xs">
                    #{issue.id} Â· {issue.title}
                </span>
            </nav>

            {/* Issue card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Header */}
                <div className={`px-5 sm:px-6 py-4 sm:py-5 border-b ${issue.needs_attention ? 'bg-red-50 border-red-100' : (PRIORITY_HEADER_BG[issue.priority] ?? 'border-slate-100')}`}>
                    {issue.needs_attention && (
                        <div className="inline-flex items-center gap-1.5 text-red-600 text-xs font-bold bg-red-100 px-2.5 py-1 rounded-full mb-3">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            Needs Attention
                        </div>
                    )}
                    <div className="flex items-start justify-between gap-3">
                        <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug flex-1 min-w-0">
                            {issue.title}
                        </h1>
                        <button
                            onClick={() => setEditing((e) => !e)}
                            className={`shrink-0 px-3 py-1.5 text-sm font-semibold rounded-xl transition ${editing ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            {editing ? 'Cancel' : 'Edit'}
                        </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                        <PriorityBadge priority={issue.priority} />
                        <StatusBadge status={issue.status} />
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/80 text-slate-500 border border-slate-200 capitalize">{issue.category}</span>
                        <span className="text-xs text-slate-400 font-mono ml-auto">#{issue.id}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">
                        {new Date(issue.created_at).toLocaleString()}
                    </p>
                </div>

                <div className="px-5 sm:px-6 py-5 space-y-6">
                    {editing ? (
                        <EditIssuePanel issue={issue} onUpdated={handleUpdated} onCancel={() => setEditing(false)} />
                    ) : (
                        <>
                            {/* Description */}
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Description</h3>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{issue.description}</p>
                            </div>

                            {/* AI Summary */}
                            <div className="rounded-2xl overflow-hidden border border-indigo-100">
                                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m1.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.405A1 1 0 0113 20H11a1 1 0 01-.764-1.645l-.347-.405z" />
                                        </svg>
                                        Smart Summary
                                    </h3>
                                    <SummaryStatusBadge status={issue.summary_status} />
                                </div>
                                <div className="bg-indigo-50 px-4 py-4">
                                    {issue.summary_status === 'ready' && issue.summary ? (
                                        <div className="space-y-3">
                                            <p className="text-sm text-indigo-900 leading-relaxed">{issue.summary}</p>
                                            {issue.suggested_next_action && (
                                                <div className="bg-white rounded-xl p-3.5 border border-indigo-100 shadow-xs">
                                                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-wide mb-1">Suggested next action</p>
                                                    <p className="text-sm text-slate-800 font-medium">{issue.suggested_next_action}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : issue.summary_status === 'pending' ? (
                                        <div className="flex items-center gap-2 text-indigo-600">
                                            <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            <p className="text-sm">Generating summary in the backgroundâ€¦</p>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-red-500">
                                            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            <p className="text-sm">Summary generation failed. It will be retried automatically.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Comments */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            Comments
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                                {issue.comments?.length ?? 0}
                            </span>
                        </h3>

                        {(!issue.comments || issue.comments.length === 0) ? (
                            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100">
                                <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                <p className="text-sm text-slate-500 font-medium">No comments yet</p>
                                <p className="text-xs text-slate-400 mt-0.5">Be the first to comment.</p>
                            </div>
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
