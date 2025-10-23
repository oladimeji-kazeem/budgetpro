import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AUM = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Assets Under Management</h1>
        <p className="text-muted-foreground mt-1">
          Track and analyze AUM performance
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>AUM Overview</CardTitle>
          <CardDescription>
            Detailed breakdown and analytics for assets under management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            AUM module coming soon. Details to be provided.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AUM;
