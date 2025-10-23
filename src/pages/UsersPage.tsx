import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

const UsersPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage users, roles, and permissions
          </p>
        </div>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
          <CardDescription>
            View and manage all system users with extended authentication fields
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            User management interface coming soon
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersPage;
