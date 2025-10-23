import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

const RegionsTab = () => {
  const [newRegion, setNewRegion] = useState("");
  const queryClient = useQueryClient();

  const { data: regions, isLoading } = useQuery({
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

  const addMutation = useMutation({
    mutationFn: async (regionName: string) => {
      const { error } = await supabase
        .from("dim_region")
        .insert({ region_name: regionName });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      setNewRegion("");
      toast.success("Region added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add region");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (regionId: string) => {
      const { error } = await supabase
        .from("dim_region")
        .delete()
        .eq("region_id", regionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      toast.success("Region deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete region");
    },
  });

  const handleAdd = () => {
    if (!newRegion.trim()) {
      toast.error("Please enter a region name");
      return;
    }
    addMutation.mutate(newRegion.trim());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Regional Groupings</CardTitle>
        <CardDescription>
          Manage the company's regional groupings across Nigeria
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="region-name">Region Name</Label>
            <Input
              id="region-name"
              value={newRegion}
              onChange={(e) => setNewRegion(e.target.value)}
              placeholder="Enter region name"
              className="mt-2"
            />
          </div>
          <Button onClick={handleAdd} disabled={addMutation.isPending} className="gap-2">
            <PlusCircle className="w-4 h-4" />
            Add Region
          </Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Region Name</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : regions?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No regions found. Add your first region above.
                  </TableCell>
                </TableRow>
              ) : (
                regions?.map((region) => (
                  <TableRow key={region.region_id}>
                    <TableCell className="font-medium">{region.region_name}</TableCell>
                    <TableCell>{new Date(region.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(region.region_id)}
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

export default RegionsTab;
