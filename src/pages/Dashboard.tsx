import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Activity } from "lucide-react";

const stats = [
  {
    title: "Total AUM",
    value: "₦125.4B",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "Budget Variance",
    value: "₦2.1B",
    change: "-3.2%",
    trend: "down",
    icon: Target,
  },
  {
    title: "Active Contributors",
    value: "45,678",
    change: "+8.1%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Performance Index",
    value: "94.2%",
    change: "+2.4%",
    trend: "up",
    icon: Activity,
  },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of budget performance and key metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
          
          return (
            <Card key={stat.title} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendIcon
                    className={`w-4 h-4 ${
                      stat.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      stat.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-sm text-muted-foreground">vs last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "Budget submitted", dept: "Operations", time: "2 hours ago" },
                { action: "Historical data uploaded", dept: "Finance", time: "5 hours ago" },
                { action: "Forecast generated", dept: "Strategy", time: "1 day ago" },
                { action: "Analysis completed", dept: "Planning", time: "2 days ago" },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-foreground">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.dept}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Upload Historical Data", path: "/historical" },
                { label: "Submit Budget", path: "/inputs" },
                { label: "View Forecast", path: "/forecast" },
                { label: "Run Analysis", path: "/analysis" },
              ].map((action) => (
                <a
                  key={action.label}
                  href={action.path}
                  className="flex items-center justify-center p-4 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-all text-center font-medium"
                >
                  {action.label}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
