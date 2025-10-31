import React, { useState, useEffect } from 'react';
import AuthService from '../api/auth';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { authTokens } = useAuth(); // Get the full tokens object

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                if (!authTokens) {
                    setError("Authentication tokens not found.");
                    setLoading(false);
                    return;
                }
                const response = await AuthService.getAccessRequests(authTokens.access);
                setRequests(response.data);
            } catch (err) {
                setError('Failed to fetch access requests.');
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [authTokens]);

    if (loading) return <p className="text-center mt-8">Loading...</p>;
    if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

    return (
        <div className="container mx-auto mt-8">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard: User Access Requests</h1>
            {/* You would map over `requests` here to display them in a table */}
            <p>Found {requests.length} pending requests.</p>
        </div>
    );
};

export default AdminDashboard;