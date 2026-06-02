import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import IssuesPage from '../pages/IssuesPage';
import IssueDetailPage from '../pages/IssueDetailPage';

export default function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<IssuesPage />} />
                <Route path="/issues/:id" element={<IssueDetailPage />} />
            </Routes>
        </Layout>
    );
}
