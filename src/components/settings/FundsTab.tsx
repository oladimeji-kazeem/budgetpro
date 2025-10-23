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
import { Badge } from "@/components/ui/badge";

const FundsTab = () => {
  const [newFund, setNewFund] = useState({
    name: "",
    code: "",
    category: "",
    riskProfile: "",
    eligibility: "",
    allocation: "",
  });
  const queryClient = useQueryClient();

  const { data: funds, isLoading } = useQuery({
    queryKey: ["funds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dim_fund")
        .select("*")
        .order("fund_name");
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("dim_fund").insert([{
        fund_name: newFund.name.trim(),
        fund_code: newFund.code.trim() || null,
        fund_category: newFund.category as any,
        risk_profile: newFund.riskProfile as any,
        eligibility: newFund.eligibility.trim() || null,
        variable_income_allocation: newFund.allocation ? parseFloat(newFund.allocation) : null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      setNewFund({ name: "", code: "", category: "", riskProfile: "", eligibility: "", allocation: "" });
      toast.success("Fund added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add fund");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (fundId: string) => {
      const { error } = await supabase.from("dim_fund").delete().eq("fund_id", fundId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      toast.success("Fund deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete fund");
    },
  });

  const handleAdd = () => {
    if (!newFund.name.trim() || !newFund.category || !newFund.riskProfile) {
      toast.error("Please fill in all required fields");
      return;
    }
    addMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>RSA Funds Management</CardTitle>
        <CardDescription>Manage Retirement Savings Account (RSA) funds</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="fund-name">Fund Name *</Label>
            <Input
              id="fund-name"
              value={newFund.name}
              onChange={(e) => setNewFund({ ...newFund, name: e.target.value })}
              placeholder="Enter fund name"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="fund-code">Fund Code</Label>
            <Input
              id="fund-code"
              value={newFund.code}
              onChange={(e) => setNewFund({ ...newFund, code: e.target.value })}
              placeholder="Enter fund code"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={newFund.category} onValueChange={(value) => setNewFund({ ...newFund, category: value })}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rsa_i">RSA I</SelectItem>
                <SelectItem value="rsa_ii">RSA II</SelectItem>
                <SelectItem value="rsa_iii">RSA III</SelectItem>
                <SelectItem value="rsa_iv">RSA IV</SelectItem>
                <SelectItem value="micro_pension">Micro Pension</SelectItem>
                <SelectItem value="approved_existing_scheme">Approved Existing Scheme</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="risk">Risk Profile *</Label>
            <Select value={newFund.riskProfile} onValueChange={(value) => setNewFund({ ...newFund, riskProfile: value })}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">Conservative</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="aggressive">Aggressive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="eligibility">Eligibility</Label>
            <Input
              id="eligibility"
              value={newFund.eligibility}
              onChange={(e) => setNewFund({ ...newFund, eligibility: e.target.value })}
              placeholder="e.g., Below 50 years"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="allocation">Variable Income (%)</Label>
            <Input
              id="allocation"
              type="number"
              step="0.01"
              value={newFund.allocation}
              onChange={(e) => setNewFund({ ...newFund, allocation: e.target.value })}
              placeholder="0.00"
              className="mt-2"
            />
          </div>
          <div className="md:col-span-2 flex items-end">
            <Button onClick={handleAdd} disabled={addMutation.isPending} className="gap-2 w-full">
              <PlusCircle className="w-4 h-4" />
              Add Fund
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fund Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Risk Profile</TableHead>
                <TableHead>Eligibility</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : funds?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No funds found. Add your first fund above.
                  </TableCell>
                </TableRow>
              ) : (
                funds?.map((fund) => (
                  <TableRow key={fund.fund_id}>
                    <TableCell className="font-medium">{fund.fund_name}</TableCell>
                    <TableCell>{fund.fund_code || "N/A"}</TableCell>
                    <TableCell className="uppercase">{fund.fund_category.replace(/_/g, " ")}</TableCell>
                    <TableCell className="capitalize">{fund.risk_profile}</TableCell>
                    <TableCell>{fund.eligibility || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={fund.is_active ? "default" : "secondary"}>
                        {fund.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(fund.fund_id)}
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

export default FundsTab;
