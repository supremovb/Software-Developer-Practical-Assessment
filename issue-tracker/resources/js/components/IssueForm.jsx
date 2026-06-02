import React, { useState } from 'react';
import { issues as issuesApi } from '../api/client';

const CATEGORIES = ['billing', 'auth', 'performance', 'bug', 'feature', 'deployment', 'data', 'security'];

const LABEL = 'block text-sm font-semibold text-slate-700 mb-1.5';
const INPUT = 'block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 bg-white shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-slate-400';

function FieldError({ errors, name }) {
    const msg = errors?.[name]?.[0];
    if (!msg) return null;
    return <p className="mt-1 text-xs text-red-600">{msg}</p>;
}

export default function IssueForm({ onCreated, onCancel }) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        priority: 'medium',
        category: 'bug',
        status: 'open',
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSubmitting(true);
        try {
            const res = await issuesApi.create(form);
            onCreated(res.data.data);
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors ?? {});
            } else {
                setErrors({ title: ['An unexpected error occurred. Please try again.'] });
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
                {/* Title */}
                <div>
                    <label className={LABEL}>Title <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={form.title}
                        onChange={set('title')}
                        placeholder="Brief, descriptive title"
                        className={INPUT}
                    />
                    <FieldError errors={errors} name="title" />
                </div>

                {/* Description */}
                <div>
                    <label className={LABEL}>Description <span className="text-red-500">*</span></label>
                    <textarea
                        rows={4}
                        value={form.description}
                        onChange={set('description')}
                        placeholder="Detailed description of the issue…"
                        className={INPUT + ' resize-none'}
                    />
                    <FieldError errors={errors} name="description" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Priority */}
                    <div>
                        <label className={LABEL}>Priority <span className="text-red-500">*</span></label>
                        <select value={form.priority} onChange={set('priority')} className={INPUT}>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                        <FieldError errors={errors} name="priority" />
                    </div>

                    {/* Category */}
                    <div>
                        <label className={LABEL}>Category <span className="text-red-500">*</span></label>
                        <select value={form.category} onChange={set('category')} className={INPUT}>
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        <FieldError errors={errors} name="category" />
                    </div>

                    {/* Status */}
                    <div>
                        <label className={LABEL}>Status</label>
                        <select value={form.status} onChange={set('status')} className={INPUT}>
                            <option value="open">Open</option>
                            <option value="in_progress">In progress</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-indigo-200 transition active:scale-95"
                >
                    {submitting ? 'Creating…' : 'Create Issue'}
                </button>
            </div>
        </form>
    );
}
