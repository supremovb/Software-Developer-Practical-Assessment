import React from 'react';

export default function LoadingSpinner({ label = 'Loading…' }) {
    return (
        <div className="space-y-3 py-4">
            {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 animate-pulse">
                    <div className="flex gap-2 mb-3">
                        <div className="h-5 w-14 bg-slate-100 rounded-full" />
                        <div className="h-5 w-20 bg-slate-100 rounded-full" />
                        <div className="h-5 w-12 bg-slate-100 rounded-full" />
                    </div>
                    <div className="h-4 bg-slate-100 rounded-lg w-3/4 mb-2" />
                    <div className="h-3 bg-slate-100 rounded-lg w-full mb-1" />
                    <div className="h-3 bg-slate-100 rounded-lg w-2/3" />
                    <div className="mt-3 flex justify-between">
                        <div className="h-3 w-24 bg-slate-100 rounded-full" />
                        <div className="h-5 w-16 bg-slate-100 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}
