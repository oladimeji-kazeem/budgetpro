import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../api/auth.js';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        department: '',
        role: 'DO', // Default role
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await AuthService.register(formData);
            setMessage('Registration successful! Please wait for admin approval.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Registration failed. Please try again.';
            setMessage(errorMessage);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-8 border rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
            <form onSubmit={handleSubmit}>
                {/* Form fields with Tailwind CSS classes */}
                <div className="mb-4">
                    <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
                </div>
                <div className="mb-4">
                    <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
                </div>
                <div className="mb-4 flex space-x-4">
                    <input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required className="w-1/2 px-3 py-2 border rounded" />
                    <input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required className="w-1/2 px-3 py-2 border rounded" />
                </div>
                <div className="mb-4">
                    <input type="text" name="department" placeholder="Department" value={formData.department} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
                </div>
                <div className="mb-6">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Select Role</label>
                    <select name="role" id="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2 border rounded bg-white">
                        <option value="DO">Dept Officer</option>
                        <option value="HOD">Head of Department</option>
                    </select>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors">
                    Register
                </button>
            </form>
            {message && <p className="mt-4 text-center text-sm text-red-600">{message}</p>}
        </div>
    );
};

export default Register;