import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Banknote, LineChart, Cpu, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Define Navigation Items based on roles (as per your request)
const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['DO', 'HOD', 'AA', 'SA'] },
    { name: 'User Management', path: '/admin-dashboard', icon: Users, roles: ['AA', 'SA'] },
    { name: 'Historical Position', path: '/historical-position', icon: FileText, roles: ['DO', 'HOD', 'AA', 'SA'] },
    { name: 'Budget Input', path: '/budget-input', icon: Banknote, roles: ['DO', 'HOD'] },
    { name: 'AUM Management', path: '/aum-management', icon: LineChart, roles: ['AA', 'SA'] },
    { name: 'Forecast', path: '/forecast', icon: Cpu, roles: ['HOD', 'AA', 'SA'] },
    { name: 'Analysis', path: '/analysis', icon: LineChart, roles: ['AA', 'SA'] },
];

const Sidebar = () => {
    const { user } = useAuth();
    const location = useLocation();

    // Determine the user's role for filtering
    const userRole = user?.role;

    if (!user) return null; // Hide sidebar if not authenticated

    return (
        <div className="flex flex-col w-64 bg-gray-800 text-white shadow-xl min-h-screen">
            
            {/* Header: Logo and Title */}
            <div className="p-4 border-b border-gray-700">
                <Link to="/dashboard" className="text-xl font-bold text-white flex items-center">
                    {/* Placeholder for small logo icon */}
                    <span className="w-3 h-3 rounded-full bg-blue-400 mr-2"></span> 
                    BudgetPro
                </Link>
                <p className="text-xs text-gray-400 mt-1">Leadway Pensure PFA</p>
            </div>
            
            {/* Modules Section */}
            <div className="p-4">
                <h3 className="text-xs uppercase text-gray-500 font-semibold mb-3 tracking-wider">Modules</h3>
                <nav className="space-y-1">
                    {navItems
                        .filter(item => item.roles.includes(userRole))
                        .map(item => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center p-3 rounded-lg transition-colors duration-150 
                                    ${location.pathname.startsWith(item.path) 
                                        ? 'bg-indigo-600 text-white shadow-lg' 
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                            >
                                <item.icon className="w-5 h-5 mr-3" />
                                <span className="font-medium text-sm">{item.name}</span>
                            </Link>
                        ))}
                </nav>
            </div>

            {/* Settings Link (Fixed at Bottom) */}
            <div className="mt-auto p-4 border-t border-gray-700">
                <Link
                    to="/settings"
                    className={`flex items-center p-3 rounded-lg transition-colors duration-150 
                        ${location.pathname === '/settings' 
                            ? 'bg-indigo-600 text-white shadow-lg' 
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                >
                    <Settings className="w-5 h-5 mr-3" />
                    <span className="font-medium text-sm">Settings</span>
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;
