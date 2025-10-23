import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2, Upload, Download } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const AccountsTab = () => {
  const [newAccount, setNewAccount] = useState({
    code: "",
    name: "",
    category: "",
    subCategory: "",
    statement: "",
    postable: "true",
  });
  const queryClient = useQueryClient();

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dim_account")
        .select("*")
        .order("account_code");
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("dim_account").insert([{
        account_code: newAccount.code.trim(),
        account_name: newAccount.name.trim(),
        account_category: newAccount.category as any,
        sub_category: newAccount.subCategory.trim() || null,
        financial_statement: newAccount.statement as any,
        postable: newAccount.postable === "true",
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setNewAccount({ code: "", name: "", category: "", subCategory: "", statement: "", postable: "true" });
      toast.success("Account added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add account");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (accountId: string) => {
      const { error } = await supabase.from("dim_account").delete().eq("account_id", accountId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Account deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete account");
    },
  });

  const handleAdd = () => {
    if (!newAccount.code.trim() || !newAccount.name.trim() || !newAccount.category || !newAccount.statement) {
      toast.error("Please fill in all required fields");
      return;
    }
    addMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Chart of Accounts</CardTitle>
            <CardDescription>Manage your chart of accounts and account hierarchy</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Download Template
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Upload className="w-4 h-4" />
              Upload Accounts
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="account-code">Account Code *</Label>
            <Input
              id="account-code"
              value={newAccount.code}
              onChange={(e) => setNewAccount({ ...newAccount, code: e.target.value })}
              placeholder="e.g., 1000"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="account-name">Account Name *</Label>
            <Input
              id="account-name"
              value={newAccount.name}
              onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
              placeholder="Enter account name"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={newAccount.category} onValueChange={(value) => setNewAccount({ ...newAccount, category: value })}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asset">Asset</SelectItem>
                <SelectItem value="liability">Liability</SelectItem>
                <SelectItem value="equity">Equity</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="sub-category">Sub-Category</Label>
            <Input
              id="sub-category"
              value={newAccount.subCategory}
              onChange={(e) => setNewAccount({ ...newAccount, subCategory: e.target.value })}
              placeholder="e.g., Current Asset"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="statement">Financial Statement *</Label>
            <Select value={newAccount.statement} onValueChange={(value) => setNewAccount({ ...newAccount, statement: value })}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select statement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="balance_sheet">Balance Sheet</SelectItem>
                <SelectItem value="income_statement">Income Statement</SelectItem>
                <SelectItem value="cash_flow">Cash Flow</SelectItem>
                <SelectItem value="statement_of_changes_in_equity">Statement of Changes in Equity</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="postable">Postable *</Label>
            <Select value={newAccount.postable} onValueChange={(value) => setNewAccount({ ...newAccount, postable: value })}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 flex items-end">
            <Button onClick={handleAdd} disabled={addMutation.isPending} className="gap-2 w-full">
              <PlusCircle className="w-4 h-4" />
              Add Account
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Sub-Category</TableHead>
                <TableHead>Statement</TableHead>
                <TableHead>Postable</TableHead>
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
              ) : accounts?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No accounts found. Add your first account above or upload a chart of accounts.
                  </TableCell>
                </TableRow>
              ) : (
                accounts?.map((account) => (
                  <TableRow key={account.account_id}>
                    <TableCell className="font-mono font-medium">{account.account_code}</TableCell>
                    <TableCell>{account.account_name}</TableCell>
                    <TableCell className="capitalize">{account.account_category}</TableCell>
                    <TableCell>{account.sub_category || "N/A"}</TableCell>
                    <TableCell className="capitalize">{account.financial_statement.replace(/_/g, " ")}</TableCell>
                    <TableCell>
                      <Badge variant={account.postable ? "default" : "secondary"}>
                        {account.postable ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={account.status ? "default" : "secondary"}>
                        {account.status ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(account.account_id)}
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

export default AccountsTab;
