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

const LocationsTab = () => {
  const [newLocation, setNewLocation] = useState({ name: "", address: "", state: "", region: "" });
  const queryClient = useQueryClient();

  const { data: states } = useQuery({
    queryKey: ["states"],
    queryFn: async () => {
      const { data, error } = await supabase.from("dim_state").select("*").order("state_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: regions } = useQuery({
    queryKey: ["regions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("dim_region").select("*").order("region_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: locations, isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dim_location")
        .select("*, dim_state(state_name), dim_region(region_name)")
        .order("location_name");
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("dim_location").insert({
        location_name: newLocation.name.trim(),
        address: newLocation.address.trim() || null,
        state_id: newLocation.state || null,
        region_id: newLocation.region || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setNewLocation({ name: "", address: "", state: "", region: "" });
      toast.success("Location added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add location");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (locationId: string) => {
      const { error } = await supabase.from("dim_location").delete().eq("location_id", locationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast.success("Location deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete location");
    },
  });

  const handleAdd = () => {
    if (!newLocation.name.trim()) {
      toast.error("Please enter a location name");
      return;
    }
    addMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Locations</CardTitle>
        <CardDescription>Manage physical business locations across Nigeria</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <Label htmlFor="location-name">Location Name</Label>
            <Input
              id="location-name"
              value={newLocation.name}
              onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
              placeholder="Enter location name"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={newLocation.address}
              onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
              placeholder="Enter address"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Select value={newLocation.state} onValueChange={(value) => setNewLocation({ ...newLocation, state: value })}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {states?.map((state) => (
                  <SelectItem key={state.state_id} value={state.state_id}>
                    {state.state_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="region">Region</Label>
            <Select value={newLocation.region} onValueChange={(value) => setNewLocation({ ...newLocation, region: value })}>
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
            Add Location
          </Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Region</TableHead>
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
              ) : locations?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No locations found. Add your first location above.
                  </TableCell>
                </TableRow>
              ) : (
                locations?.map((location) => (
                  <TableRow key={location.location_id}>
                    <TableCell className="font-medium">{location.location_name}</TableCell>
                    <TableCell>{location.address || "N/A"}</TableCell>
                    <TableCell>{location.dim_state?.state_name || "N/A"}</TableCell>
                    <TableCell>{location.dim_region?.region_name || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(location.location_id)}
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

export default LocationsTab;
