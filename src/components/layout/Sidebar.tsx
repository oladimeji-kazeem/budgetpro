import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  History, 
  FileInput, 
  TrendingUp, 
  LineChart, 
  BarChart3,
  Users,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/ubasify-logo.png";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Users", path: "/users" },
  { icon: History, label: "Historical Data", path: "/historical" },
  { icon: FileInput, label: "Budget Inputs", path: "/inputs" },
  { icon: TrendingUp, label: "AUM", path: "/aum" },
  { icon: LineChart, label: "Forecast", path: "/forecast" },
  { icon: BarChart3, label: "Analysis", path: "/analysis" },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img src={logo} alt="BudgetPro" className="w-10 h-10" />
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">BudgetPro</h1>
            <p className="text-xs text-sidebar-foreground/70">Leadway Pensure PFA</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all"
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
};
