import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const SectorsTab = () => {
  const [newSector, setNewSector] = useState({ name: "", code: "", description: "" });
  const queryClient = useQueryClient();

  const { data: sectors, isLoading } = useQuery({
    queryKey: ["sectors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dim_sector")
        .select("*")
        .order("sector_name");
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("dim_sector").insert({
        sector_name: newSector.name.trim(),
        sector_code: newSector.code.trim() || null,
        description: newSector.description.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sectors"] });
      setNewSector({ name: "", code: "", description: "" });
      toast.success("Sector added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add sector");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (sectorId: string) => {
      const { error } = await supabase.from("dim_sector").delete().eq("sector_id", sectorId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sectors"] });
      toast.success("Sector deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete sector");
    },
  });

  const handleAdd = () => {
    if (!newSector.name.trim()) {
      toast.error("Please enter a sector name");
      return;
    }
    addMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Economic Sectors</CardTitle>
        <CardDescription>Manage economic sectors for investment classification</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <Label htmlFor="sector-name">Sector Name</Label>
            <Input
              id="sector-name"
              value={newSector.name}
              onChange={(e) => setNewSector({ ...newSector, name: e.target.value })}
              placeholder="Enter sector name"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="sector-code">Sector Code</Label>
            <Input
              id="sector-code"
              value={newSector.code}
              onChange={(e) => setNewSector({ ...newSector, code: e.target.value })}
              placeholder="Enter sector code"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={newSector.description}
              onChange={(e) => setNewSector({ ...newSector, description: e.target.value })}
              placeholder="Enter description"
              className="mt-2"
            />
          </div>
          <Button onClick={handleAdd} disabled={addMutation.isPending} className="gap-2">
            <PlusCircle className="w-4 h-4" />
            Add Sector
          </Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sector Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : sectors?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No sectors found. Add your first sector above.
                  </TableCell>
                </TableRow>
              ) : (
                sectors?.map((sector) => (
                  <TableRow key={sector.sector_id}>
                    <TableCell className="font-medium">{sector.sector_name}</TableCell>
                    <TableCell>{sector.sector_code || "N/A"}</TableCell>
                    <TableCell>{sector.description || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={sector.is_active ? "default" : "secondary"}>
                        {sector.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(sector.sector_id)}
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

export default SectorsTab;
