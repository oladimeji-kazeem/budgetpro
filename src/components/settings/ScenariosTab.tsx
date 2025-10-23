import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const ScenariosTab = () => {
  const [newScenario, setNewScenario] = useState({
    code: "",
    name: "",
    type: "",
    fiscalYear: new Date().getFullYear().toString(),
    description: "",
    isBaseline: "false",
  });
  const queryClient = useQueryClient();

  const { data: scenarios, isLoading } = useQuery({
    queryKey: ["scenarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dim_scenario")
        .select("*")
        .order("fiscal_year", { ascending: false })
        .order("scenario_name");
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("dim_scenario").insert([{
        scenario_code: newScenario.code.trim(),
        scenario_name: newScenario.name.trim(),
        scenario_type: newScenario.type as any,
        fiscal_year: parseInt(newScenario.fiscalYear),
        description: newScenario.description.trim() || null,
        is_baseline: newScenario.isBaseline === "true",
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scenarios"] });
      setNewScenario({
        code: "",
        name: "",
        type: "",
        fiscalYear: new Date().getFullYear().toString(),
        description: "",
        isBaseline: "false",
      });
      toast.success("Scenario added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add scenario");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (scenarioId: string) => {
      const { error } = await supabase.from("dim_scenario").delete().eq("scenario_id", scenarioId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scenarios"] });
      toast.success("Scenario deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete scenario");
    },
  });

  const handleAdd = () => {
    if (!newScenario.code.trim() || !newScenario.name.trim() || !newScenario.type || !newScenario.fiscalYear) {
      toast.error("Please fill in all required fields");
      return;
    }
    addMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget & Forecast Scenarios</CardTitle>
        <CardDescription>Manage budget scenarios, forecasts, and what-if analyses</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="scenario-code">Scenario Code *</Label>
            <Input
              id="scenario-code"
              value={newScenario.code}
              onChange={(e) => setNewScenario({ ...newScenario, code: e.target.value })}
              placeholder="e.g., BUD2025"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="scenario-name">Scenario Name *</Label>
            <Input
              id="scenario-name"
              value={newScenario.name}
              onChange={(e) => setNewScenario({ ...newScenario, name: e.target.value })}
              placeholder="Enter scenario name"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="type">Scenario Type *</Label>
            <Select value={newScenario.type} onValueChange={(value) => setNewScenario({ ...newScenario, type: value })}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="actual">Actual</SelectItem>
                <SelectItem value="budget">Budget</SelectItem>
                <SelectItem value="forecast">Forecast</SelectItem>
                <SelectItem value="revised_budget">Revised Budget</SelectItem>
                <SelectItem value="what_if">What-If Analysis</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="fiscal-year">Fiscal Year *</Label>
            <Input
              id="fiscal-year"
              type="number"
              value={newScenario.fiscalYear}
              onChange={(e) => setNewScenario({ ...newScenario, fiscalYear: e.target.value })}
              placeholder="2025"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="baseline">Is Baseline?</Label>
            <Select value={newScenario.isBaseline} onValueChange={(value) => setNewScenario({ ...newScenario, isBaseline: value })}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={newScenario.description}
              onChange={(e) => setNewScenario({ ...newScenario, description: e.target.value })}
              placeholder="Enter description"
              className="mt-2"
            />
          </div>
        </div>
        <Button onClick={handleAdd} disabled={addMutation.isPending} className="gap-2 w-full md:w-auto">
          <PlusCircle className="w-4 h-4" />
          Add Scenario
        </Button>

        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Scenario Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Fiscal Year</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Baseline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : scenarios?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No scenarios found. Add your first scenario above.
                  </TableCell>
                </TableRow>
              ) : (
                scenarios?.map((scenario) => (
                  <TableRow key={scenario.scenario_id}>
                    <TableCell className="font-mono font-medium">{scenario.scenario_code}</TableCell>
                    <TableCell>{scenario.scenario_name}</TableCell>
                    <TableCell className="capitalize">{scenario.scenario_type.replace(/_/g, " ")}</TableCell>
                    <TableCell>{scenario.fiscal_year}</TableCell>
                    <TableCell>v{scenario.version}</TableCell>
                    <TableCell>
                      <Badge variant={scenario.is_baseline ? "default" : "secondary"}>
                        {scenario.is_baseline ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={scenario.is_active ? "default" : "secondary"}>
                        {scenario.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(scenario.scenario_id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScenariosTab;
