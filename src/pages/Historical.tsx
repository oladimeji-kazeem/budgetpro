import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileSpreadsheet, Download, Printer } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const Historical = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedFund, setSelectedFund] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  
  const [years, setYears] = useState<string[]>([]);
  const [funds, setFunds] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  
  const [incomeData, setIncomeData] = useState<any[]>([]);
  const [balanceData, setBalanceData] = useState<any[]>([]);
  const [managedFundData, setManagedFundData] = useState<any[]>([]);
  const [rsaFundData, setRsaFundData] = useState<any[]>([]);

  useEffect(() => {
    fetchFilterData();
    fetchFinancialData();
  }, [selectedYear, selectedFund, selectedLocation, selectedState, selectedRegion]);

  const fetchFilterData = async () => {
    // Fetch years from dim_date
    const { data: dateData } = await supabase
      .from("dim_date")
      .select("year")
      .order("year", { ascending: false });
    if (dateData) {
      const uniqueYears = [...new Set(dateData.map(d => d.year.toString()))];
      setYears(uniqueYears);
    }

    // Fetch funds
    const { data: fundData } = await supabase
      .from("dim_fund")
      .select("*")
      .eq("is_active", true);
    if (fundData) setFunds(fundData);

    // Fetch locations
    const { data: locationData } = await supabase
      .from("dim_location")
      .select("*")
      .eq("is_active", true);
    if (locationData) setLocations(locationData);

    // Fetch states
    const { data: stateData } = await supabase
      .from("dim_state")
      .select("*");
    if (stateData) setStates(stateData);

    // Fetch regions
    const { data: regionData } = await supabase
      .from("dim_region")
      .select("*");
    if (regionData) setRegions(regionData);
  };

  const fetchFinancialData = async () => {
    // Build query filters
    let query = supabase
      .from("fact_gl_transaction")
      .select(`
        *,
        dim_account!inner(*),
        dim_date!inner(*),
        dim_fund(*),
        dim_location(*)
      `)
      .eq("dim_date.year", parseInt(selectedYear));

    if (selectedFund !== "all") query = query.eq("fund_id", selectedFund);
    if (selectedLocation !== "all") query = query.eq("location_id", selectedLocation);

    const { data: transactionData } = await query;

    if (transactionData) {
      // Process Income Statement data
      const incomeTransactions = transactionData.filter(
        t => t.dim_account?.financial_statement === "income_statement"
      );
      setIncomeData(processMonthlyData(incomeTransactions));

      // Process Balance Sheet data
      const balanceTransactions = transactionData.filter(
        t => t.dim_account?.financial_statement === "balance_sheet"
      );
      setBalanceData(processMonthlyData(balanceTransactions));
    }

    // Fetch AUM data for funds
    let aumQuery = supabase
      .from("dim_aum")
      .select(`
        *,
        dim_date!inner(*),
        dim_fund!inner(*)
      `)
      .eq("dim_date.year", parseInt(selectedYear));

    if (selectedFund !== "all") aumQuery = aumQuery.eq("fund_id", selectedFund);

    const { data: aumData } = await aumQuery;

    if (aumData) {
      // Managed Funds - filter for approved existing schemes
      const managedData = aumData.filter(
        a => a.dim_fund?.fund_category === "approved_existing_scheme"
      );
      setManagedFundData(processAUMMonthlyData(managedData));

      // RSA Funds - filter for RSA types
      const rsaData = aumData.filter(
        a => a.dim_fund?.fund_category && 
        ["rsa_i", "rsa_ii", "rsa_iii", "rsa_iv"].includes(a.dim_fund.fund_category)
      );
      setRsaFundData(processAUMMonthlyData(rsaData));
    }
  };

  const processMonthlyData = (transactions: any[]) => {
    const accountMap = new Map();

    transactions.forEach(t => {
      const accountName = t.dim_account?.account_name || "Unknown";
      const month = t.dim_date?.month - 1; // 0-indexed
      const amount = (t.debit_amount || 0) - (t.credit_amount || 0);

      if (!accountMap.has(accountName)) {
        accountMap.set(accountName, Array(12).fill(0));
      }
      
      const monthlyData = accountMap.get(accountName);
      monthlyData[month] += amount;
    });

    return Array.from(accountMap.entries()).map(([account, months]) => ({
      account,
      months,
      total: months.reduce((sum: number, val: number) => sum + val, 0)
    }));
  };

  const processAUMMonthlyData = (aumData: any[]) => {
    const fundMap = new Map();

    aumData.forEach(a => {
      const fundName = a.dim_fund?.fund_name || "Unknown";
      const month = a.dim_date?.month - 1; // 0-indexed
      const amount = a.total_aum || 0;

      if (!fundMap.has(fundName)) {
        fundMap.set(fundName, Array(12).fill(0));
      }
      
      const monthlyData = fundMap.get(fundName);
      monthlyData[month] = amount;
    });

    return Array.from(fundMap.entries()).map(([fund, months]) => ({
      fund,
      months,
      total: months.reduce((sum: number, val: number) => sum + val, 0) / 12 // Average for funds
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }
    toast.success("File uploaded successfully");
    setSelectedFile(null);
    fetchFinancialData(); // Refresh data after upload
  };

  const renderMonthlyTable = (data: any[], label: string) => {
    if (data.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          No data available for the selected filters.
        </div>
      );
    }

    return (
      <ScrollArea className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold sticky left-0 bg-background z-10 min-w-[200px]">
                {label}
              </TableHead>
              {MONTHS.map(month => (
                <TableHead key={month} className="text-right min-w-[100px]">
                  {month}
                </TableHead>
              ))}
              <TableHead className="text-right font-semibold min-w-[120px]">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium sticky left-0 bg-background z-10">
                  {row.account || row.fund}
                </TableCell>
                {row.months.map((amount: number, monthIdx: number) => (
                  <TableCell key={monthIdx} className="text-right">
                    {amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                ))}
                <TableCell className="text-right font-semibold">
                  {row.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Historical Data</h1>
        <p className="text-muted-foreground mt-1">
          Upload and manage historical financial data
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Upload Historical Data</CardTitle>
          <CardDescription>
            Import historical data via Excel spreadsheet. The system will generate income statements, balance sheets, and fund data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="file-upload">Select Excel File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="mt-2"
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>
            <Button onClick={handleUpload} className="gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </Button>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Download Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Fund</Label>
              <Select value={selectedFund} onValueChange={setSelectedFund}>
                <SelectTrigger>
                  <SelectValue placeholder="All Funds" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Funds</SelectItem>
                  {funds.map(fund => (
                    <SelectItem key={fund.fund_id} value={fund.fund_id}>
                      {fund.fund_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Location</Label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location.location_id} value={location.location_id}>
                      {location.location_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>State</Label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {states.map(state => (
                    <SelectItem key={state.state_id} value={state.state_id}>
                      {state.state_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Region</Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region.region_id} value={region.region_id}>
                      {region.region_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="income" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="income">Income Statement</TabsTrigger>
          <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
          <TabsTrigger value="managed">Managed Funds</TabsTrigger>
          <TabsTrigger value="rsa">RSA Funds</TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Historical Income Statement - {selectedYear}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderMonthlyTable(incomeData, "Account")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Historical Balance Sheet - {selectedYear}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderMonthlyTable(balanceData, "Account")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="managed" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Monthly Managed Fund Historical - {selectedYear}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderMonthlyTable(managedFundData, "Fund")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rsa" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>RSA Fund Historical - {selectedYear}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderMonthlyTable(rsaFundData, "Fund")}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Historical;
