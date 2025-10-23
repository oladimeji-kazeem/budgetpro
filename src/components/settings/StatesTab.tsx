import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

const StatesTab = () => {
  const [newState, setNewState] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const queryClient = useQueryClient();

  const { data: regions } = useQuery({
    queryKey: ["regions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dim_region")
        .select("*")
        .order("region_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: states, isLoading } = useQuery({
    queryKey: ["states"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dim_state")
        .select("*, dim_region(region_name)")
        .order("state_name");
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("dim_state")
        .insert({ 
          state_name: newState.trim(),
          region_id: selectedRegion || null
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["states"] });
      setNewState("");
      setSelectedRegion("");
      toast.success("State added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add state");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (stateId: string) => {
      const { error } = await supabase
        .from("dim_state")
        .delete()
        .eq("state_id", stateId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["states"] });
      toast.success("State deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete state");
    },
  });

  const handleAdd = () => {
    if (!newState.trim()) {
      toast.error("Please enter a state name");
      return;
    }
    addMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>States in Nigeria</CardTitle>
        <CardDescription>
          Manage states and their regional assignments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <Label htmlFor="state-name">State Name</Label>
            <Input
              id="state-name"
              value={newState}
              onChange={(e) => setNewState(e.target.value)}
              placeholder="Enter state name"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="region">Region</Label>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {regions?.map((region) => (
                  <SelectItem key={region.region_id} value={region.region_id}>
                    {region.region_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAdd} disabled={addMutation.isPending} className="gap-2">
            <PlusCircle className="w-4 h-4" />
            Add State
          </Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>State Name</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : states?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No states found. Add your first state above.
                  </TableCell>
                </TableRow>
              ) : (
                states?.map((state) => (
                  <TableRow key={state.state_id}>
                    <TableCell className="font-medium">{state.state_name}</TableCell>
                    <TableCell>{state.dim_region?.region_name || "N/A"}</TableCell>
                    <TableCell>{new Date(state.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(state.state_id)}
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

export default StatesTab;
