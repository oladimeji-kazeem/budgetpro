import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import AuthService from '../api/auth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { login: setAuthUser } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            // Step 1: Attempt login to get JWT tokens
            const response = await AuthService.login(email, password);
            const tokens = response.data;
            
            // Step 2: Set the user and tokens in context/localStorage
            setAuthUser(tokens);

            // Step 3: Redirect based on the decoded role in the token
            const decodedToken = jwtDecode(tokens.access);
            const userRole = decodedToken.role;
            
            // Assuming default dashboard redirect logic
            if (userRole === 'AA' || userRole === 'SA') {
                navigate('/admin-dashboard');
            } else {
                navigate('/dashboard'); // Generic dashboard for DO/HOD
            }

        } catch (error) {
            // Check for specific rejection messages from Django
            const djangoError = error.response?.data?.detail;
            if (djangoError) {
                 setMessage(djangoError);
            } else if (error.response?.status === 401) {
                setMessage('Invalid credentials or user access pending approval.');
            } else {
                // Check if the backend API is running and reachable
                setMessage('Login failed. Please check your network connection and credentials.');
            }
        }
    };

    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
            {/* Left Side: The Form */}
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                            Sign in to BudgetPro
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Or{' '}
                            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                                request access to your account
                            </Link>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        <div className="space-y-4 rounded-md shadow-sm">
                            <div>
                                <label htmlFor="email" className="sr-only">Email address</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                    placeholder="Email address"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="sr-only">Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                    placeholder="Password"
                                />
                            </div>
                        </div>

                        {message && (
                            <p className="text-sm font-medium text-center text-red-600">
                                {message}
                            </p>
                        )}

                        <div>
                            <button
                                type="submit"
                                className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-3 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {/* Right Side: Branding and Image */}
            <div className="hidden lg:flex lg:items-center lg:justify-center bg-gradient-to-br from-blue-600 to-indigo-800 p-12 text-white">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tighter">
                        Welcome to BudgetPro
                    </h1>
                    <p className="mt-4 text-lg text-blue-200 max-w-md mx-auto">
                        Streamline your financial planning and unlock data-driven insights for peak performance.
                    </p>
                    {/* You can add an illustration or logo here */}
                    <div className="mt-10">
                        <div className="w-48 h-48 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
