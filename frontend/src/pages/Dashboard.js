import React from 'react';
import { useAuth } from '../context/AuthContext'; // Import useAuth to access user data
import { TrendingUp, TrendingDown, Users, BarChart2, Upload, FileCheck, DollarSign, Clock, LineChart, Cpu, Zap, FolderCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

// Utility component for a dashboard card
const MetricCard = ({ title, value, change, color, Icon, trend, linkTo }) => (
    <Link to={linkTo} className="block transition-all duration-300 hover:scale-[1.02] hover:shadow-xl bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">{title}</h3>
            <Icon className="w-5 h-5 text-indigo-400" />
        </div>
        <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
        <div className={`flex items-center text-sm font-medium ${color}`}>
            {trend === 'up' 
                ? <TrendingUp className="w-4 h-4 mr-1" />
                : <TrendingDown className="w-4 h-4 mr-1" />
            }
            {change} vs last period
        </div>
    </Link>
);

// Utility component for a quick action button
const QuickActionButton = ({ title, Icon, color, linkTo, onClick }) => (
    <Link 
        to={linkTo} 
        onClick={onClick}
        className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:bg-white hover:border-blue-300 transition duration-150 transform hover:scale-[1.03]"
    >
        <Icon className={`w-6 h-6 mb-1 ${color}`} />
        <span className="text-xs text-gray-700 font-medium text-center">{title}</span>
    </Link>
);

const Dashboard = () => {
    const { user, hasAnyRole } = useAuth(); // Get user and role checking helpers

    // Placeholder Data (To be replaced by Django API calls)
    const financialMetrics = [
        { title: 'Total AUM', value: '₦125.4B', change: '+12.5%', color: 'text-green-600', icon: DollarSign, trend: 'up', linkTo: '/aum-management' },
        { title: 'Budget Variance', value: '₦2.1B', change: '-3.2%', color: 'text-red-600', icon: BarChart2, trend: 'down', linkTo: '/analysis' },
        { title: 'Approved Budgets', value: '85%', change: '+8.1%', color: 'text-green-600', icon: FolderCheck, trend: 'up', linkTo: '/budget-input' },
        { title: 'Forecast Accuracy', value: '94.2%', change: '+2.4%', color: 'text-blue-600', icon: Zap, trend: 'up', linkTo: '/forecast' },
    ];

    const recentActivity = [
        { activity: 'Budget submitted', department: 'Operations', time: '2 hours ago', status: 'Pending HOD Approval' },
        { activity: 'Historical data uploaded', department: 'Finance', time: '5 hours ago', status: 'Completed' },
        { activity: 'User access request approved', department: 'Admin', time: '1 day ago', status: 'Completed' },
        { activity: 'Q4 Forecast Generated', department: 'Planning', time: '2 days ago', status: 'Completed' },
    ];

    // Role-specific Quick Actions
    const quickActions = [];

    if (hasAnyRole(['AA', 'SA'])) { // App Admin or Super Admin
        quickActions.push(
            { title: 'Approve Access', Icon: Users, color: 'text-purple-600', linkTo: '/admin-dashboard' },
            { title: 'Manage Users', Icon: Cpu, color: 'text-blue-600', linkTo: '/settings' }
        );
    }
    if (hasAnyRole(['DO'])) { // Department Officer
        quickActions.push(
            { title: 'Enter Budget Data', Icon: Upload, color: 'text-indigo-600', linkTo: '/budget-input' }
        );
    }
    if (hasAnyRole(['HOD'])) { // Head of Department
        quickActions.push(
            { title: 'Review Submissions', Icon: FileCheck, color: 'text-green-600', linkTo: '/budget-input' }
        );
    }
    
    // Add generic actions for everyone
    quickActions.push(
        { title: 'View Historicals', Icon: LineChart, color: 'text-gray-600', linkTo: '/historical-position' },
        { title: 'Generate Report', Icon: BarChart2, color: 'text-red-600', linkTo: '/analysis' }
    );


    return (
        <div className="w-full">
            <header className="mb-8 border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                    Welcome, {user?.email || 'User'}!
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Your current role: <span className="font-semibold text-blue-600">{user?.role || 'Guest'}</span> | Department: {user?.department || 'N/A'}
                </p>
            </header>

            {/* 1. Financial Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {financialMetrics.map((metric, index) => (
                    <MetricCard 
                        key={index} 
                        {...metric} 
                        Icon={metric.icon}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2. Recent Activity Section (2/3 width) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Recent System Activity</h2>
                    <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                            <div key={index} className="flex justify-between items-center border-b pb-3 last:border-b-0 last:pb-0">
                                <div>
                                    <p className="font-medium text-gray-900">{activity.activity}</p>
                                    <p className="text-xs text-gray-500">
                                        <span className="font-semibold">Dept:</span> {activity.department} | <span className="font-semibold">Status:</span> 
                                        <span className={`ml-1 font-bold ${activity.status.includes('Pending') ? 'text-yellow-600' : 'text-green-600'}`}>
                                            {activity.status}
                                        </span>
                                    </p>
                                </div>
                                <span className="text-xs text-gray-400 flex items-center shrink-0">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {activity.time}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Quick Actions Section (1/3 width) */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Your Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {quickActions.map((action, index) => (
                            <QuickActionButton key={index} {...action} Icon={action.Icon} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
