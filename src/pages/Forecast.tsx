import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const Forecast = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financial Forecast</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered predictions based on historical data
          </p>
        </div>
        <Button className="gap-2">
          <Sparkles className="w-4 h-4" />
          Generate Forecast
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Predictive Analytics</CardTitle>
          <CardDescription>
            The system uses historical data to generate forecasted income statements, balance sheets, and cash flow projections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            Upload historical data first to generate forecasts
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Forecast;
