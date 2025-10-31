import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../api/auth';

// Define placeholder departments for the dropdown
// NOTE: In a real application, this data should be fetched from a Django API endpoint
const DEPARTMENT_OPTIONS = [
    { value: '', label: 'Select your Department' },
    { value: 'OPS', label: 'Operations' },
    { value: 'FIN', label: 'Finance' },
    { value: 'HR', label: 'Human Resources' },
    { value: 'INV', label: 'Investment' },
    { value: 'RISK', label: 'Risk & Compliance' },
    { value: 'IT', label: 'Information Technology' },
];

const Register = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        department: '',
        password: '',
        password2: '', // For confirmation
    });
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        
        if (formData.password !== formData.password2) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }

        if (formData.department === '') {
            setMessage({ type: 'error', text: 'Please select your department.' });
            return;
        }

        setIsLoading(true);

        try {
            // Note: The backend registration endpoint should handle
            // 1. Creating the CustomUser instance with is_active=False
            // 2. Creating the UserAccessRequest instance
            // 3. Sending the email to the Access Approvers
            await AuthService.register(formData);
            
            setMessage({
                type: 'success',
                text: 'Registration successful! Your access request has been sent for approval. You will receive an email notification shortly.',
            });
            // Optionally clear the form or navigate
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                department: '',
                password: '',
                password2: '',
            });
            // After a short delay, redirect back to login
            setTimeout(() => navigate('/login'), 5000); 

        } catch (error) {
            let errorText = 'Registration failed. Please check the details.';
            
            if (error.response?.data) {
                // Handle detailed Django REST Framework errors
                const errors = error.response.data;
                if (errors.email) {
                    errorText = `Email: ${errors.email[0]}`;
                } else if (errors.password) {
                    errorText = `Password: ${errors.password[0]}`;
                } else if (errors.detail) {
                    errorText = errors.detail;
                }
            }
            setMessage({ type: 'error', text: errorText });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md mx-auto">
                <div className="p-8 bg-white shadow-2xl rounded-xl border border-gray-100">
                    
                    {/* Header Section */}
                    <div className="text-center mb-6">
                        <div className="mx-auto h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                             {/* Placeholder Icon/SVG here */}
                        </div>
                        <h1 className="text-xl font-bold text-gray-800">
                            Access Request
                        </h1>
                        <h2 className="mt-1 text-sm text-gray-500">
                            Submit your details to join BudgetPro
                        </h2>
                    </div>
                    
                    {/* Login/Sign Up Tab Bar */}
                    <div className="flex bg-gray-100 rounded-lg p-1 mb-6 text-sm font-medium">
                        <Link to="/login" className="w-1/2 text-center py-2 text-gray-500 hover:text-indigo-600 transition duration-150">
                            Login
                        </Link>
                        <span className="w-1/2 text-center py-2 bg-white rounded-lg shadow-sm text-gray-800 cursor-default">
                            Sign Up
                        </span>
                    </div>

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            {/* First Name */}
                            <div>
                                <label htmlFor="first_name" className="block text-xs font-medium text-gray-600">First Name</label>
                                <input
                                    id="first_name"
                                    name="first_name"
                                    type="text"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                    placeholder="John"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm sm:text-sm"
                                />
                            </div>
                            {/* Last Name */}
                            <div>
                                <label htmlFor="last_name" className="block text-xs font-medium text-gray-600">Last Name</label>
                                <input
                                    id="last_name"
                                    name="last_name"
                                    type="text"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Doe"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-xs font-medium text-gray-600">Company Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="john.doe@leadway-pensure.com"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm sm:text-sm"
                            />
                        </div>
                        
                        {/* Department Dropdown */}
                        <div>
                            <label htmlFor="department" className="block text-xs font-medium text-gray-600">Department</label>
                            <select
                                id="department"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm sm:text-sm bg-white"
                            >
                                {DEPARTMENT_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value} disabled={option.value === ''}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>


                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-xs font-medium text-gray-600">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Create a password"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm sm:text-sm"
                            />
                        </div>
                        
                        {/* Password Confirmation */}
                        <div>
                            <label htmlFor="password2" className="block text-xs font-medium text-gray-600">Confirm Password</label>
                            <input
                                id="password2"
                                name="password2"
                                type="password"
                                value={formData.password2}
                                onChange={handleChange}
                                required
                                placeholder="Re-enter password"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm sm:text-sm"
                            />
                        </div>

                        {message && (
                            <p className={`text-sm font-medium text-center ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {message.text}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition duration-150 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {isLoading ? 'Sending Request...' : 'Request Access'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
