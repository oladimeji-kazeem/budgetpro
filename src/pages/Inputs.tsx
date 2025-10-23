import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const Inputs = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Budget Inputs</h1>
          <p className="text-muted-foreground mt-1">
            Submit and manage departmental budget requests
          </p>
        </div>
        <Button className="gap-2">
          <PlusCircle className="w-4 h-4" />
          New Budget Request
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Budget Submission</CardTitle>
          <CardDescription>
            Department heads can submit budget requests for the upcoming fiscal year. All submissions require Executive Director approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            No budget submissions yet. Click "New Budget Request" to get started.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inputs;
