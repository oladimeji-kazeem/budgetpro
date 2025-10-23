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
import { Badge } from "@/components/ui/badge";

const DepartmentsTab = () => {
  const [newDept, setNewDept] = useState({ name: "", code: "" });
  const queryClient = useQueryClient();

  const { data: departments, isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dim_department")
        .select("*")
        .order("department_name");
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("dim_department").insert({
        department_name: newDept.name.trim(),
        department_code: newDept.code.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setNewDept({ name: "", code: "" });
      toast.success("Department added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add department");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (deptId: string) => {
      const { error } = await supabase
        .from("dim_department")
        .delete()
        .eq("department_id", deptId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete department");
    },
  });

  const handleAdd = () => {
    if (!newDept.name.trim()) {
      toast.error("Please enter a department name");
      return;
    }
    addMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Departments & Cost Centers</CardTitle>
        <CardDescription>Manage organizational departments and cost centers</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <Label htmlFor="dept-name">Department Name</Label>
            <Input
              id="dept-name"
              value={newDept.name}
              onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
              placeholder="Enter department name"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="dept-code">Department Code</Label>
            <Input
              id="dept-code"
              value={newDept.code}
              onChange={(e) => setNewDept({ ...newDept, code: e.target.value })}
              placeholder="Enter department code"
              className="mt-2"
            />
          </div>
          <Button onClick={handleAdd} disabled={addMutation.isPending} className="gap-2">
            <PlusCircle className="w-4 h-4" />
            Add Department
          </Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
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
              ) : departments?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No departments found. Add your first department above.
                  </TableCell>
                </TableRow>
              ) : (
                departments?.map((dept) => (
                  <TableRow key={dept.department_id}>
                    <TableCell className="font-medium">{dept.department_name}</TableCell>
                    <TableCell>{dept.department_code || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={dept.is_active ? "default" : "secondary"}>
                        {dept.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(dept.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(dept.department_id)}
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

export default DepartmentsTab;
