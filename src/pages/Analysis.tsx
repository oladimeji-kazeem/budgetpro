import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Analysis = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Budget Analysis</h1>
        <p className="text-muted-foreground mt-1">
          Performance analysis comparing actual vs budgeted values
        </p>
      </div>

      <Tabs defaultValue="variance" className="w-full">
        <TabsList>
          <TabsTrigger value="variance">Variance Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="variance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual Variance</CardTitle>
              <CardDescription>
                Detailed breakdown of budget variances across departments and categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                No analysis data available. Submit budgets and actuals to view variance analysis.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historical Trends</CardTitle>
              <CardDescription>
                Long-term trend analysis and pattern identification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                No trend data available. Upload historical data to view trends.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
              <CardDescription>
                Monitor critical KPIs and performance benchmarks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                No performance data available. Complete budget cycle to view KPIs.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analysis;
