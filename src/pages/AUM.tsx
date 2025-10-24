import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Upload, Download, Printer } from "lucide-react";

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

interface MonthlyData {
  [key: string]: { [month: string]: number };
}

const AUM = () => {
  const [selectedFund, setSelectedFund] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>(new Date().getFullYear().toString());
  const [dateTo, setDateTo] = useState<string>(new Date().getFullYear().toString());
  const [funds, setFunds] = useState<any[]>([]);
  const [currentAUM, setCurrentAUM] = useState<MonthlyData>({});
  const [targetAUM, setTargetAUM] = useState<MonthlyData>({});
  const [growthPercentage, setGrowthPercentage] = useState<string>("");
  const [lastYearAUM, setLastYearAUM] = useState<number>(0);
  const [currentYearAUM, setCurrentYearAUM] = useState<number>(0);
  const [editableTargetData, setEditableTargetData] = useState<MonthlyData>({});

  useEffect(() => {
    fetchFunds();
    fetchAUMData();
  }, [dateFrom, dateTo, selectedFund]);

  const fetchFunds = async () => {
    const { data, error } = await supabase.from("dim_fund").select("*").eq("is_active", true);
    if (!error && data) setFunds(data);
  };

  const fetchAUMData = async () => {
    if (!selectedFund) return;

    const { data: dates } = await supabase
      .from("dim_date")
      .select("*")
      .gte("year", parseInt(dateFrom))
      .lte("year", parseInt(dateTo))
      .order("date");

    const { data: aumData } = await supabase
      .from("dim_aum")
      .select("*, dim_date!inner(*)")
      .eq("fund_id", selectedFund)
      .eq("aum_type", "current");

    if (aumData && dates) {
      const processedData = processMonthlyAUMData(aumData, dates);
      setCurrentAUM(processedData);
      
      // Calculate current year total
      const currentTotal = Object.values(processedData['total_aum'] || {}).reduce((sum, val) => sum + val, 0);
      setCurrentYearAUM(currentTotal);
    }

    // Fetch last year data for growth calculation
    const lastYear = parseInt(dateFrom) - 1;
    const { data: lastYearData } = await supabase
      .from("dim_aum")
      .select("*, dim_date!inner(*)")
      .eq("fund_id", selectedFund)
      .eq("aum_type", "current")
      .eq("dim_date.year", lastYear);

    if (lastYearData) {
      const lastYearTotal = lastYearData.reduce((sum, item) => sum + (parseFloat(item.total_aum as any) || 0), 0);
      setLastYearAUM(lastYearTotal);
    }

    // Fetch target AUM data
    const { data: targetData } = await supabase
      .from("dim_aum")
      .select("*, dim_date!inner(*)")
      .eq("fund_id", selectedFund)
      .eq("aum_type", "target");

    if (targetData && dates) {
      const processedTarget = processMonthlyAUMData(targetData, dates);
      setTargetAUM(processedTarget);
      setEditableTargetData(processedTarget);
    }
  };

  const processMonthlyAUMData = (data: any[], dates: any[]) => {
    const monthly: MonthlyData = {
      new_pin_contribution: {},
      existing_pin_contribution: {},
      total_contribution: {},
      payout: {},
      net_contribution: {},
      investment_returns: {},
      total_rsa_balance: {},
      pfa_fee: {},
      pfc_fee: {},
      pencom_fee: {},
      vat_fee: {},
      consolidated_fees: {},
      admin_fee: {},
      vat_admin_fee: {},
      opening_aum: {},
      closing_aum: {},
      total_aum: {},
    };

    dates.forEach((date) => {
      const monthIndex = date.month - 1;
      const monthName = MONTHS[monthIndex];
      const aumRecord = data.find((d: any) => d.date_id === date.date_id);

      if (aumRecord) {
        monthly.new_pin_contribution[monthName] = parseFloat(aumRecord.new_pin_contribution) || 0;
        monthly.existing_pin_contribution[monthName] = parseFloat(aumRecord.existing_pin_contribution) || 0;
        monthly.total_contribution[monthName] = parseFloat(aumRecord.total_contribution) || 0;
        monthly.payout[monthName] = parseFloat(aumRecord.total_benefits_paid) || 0;
        monthly.net_contribution[monthName] = parseFloat(aumRecord.net_cash_flow) || 0;
        monthly.investment_returns[monthName] = parseFloat(aumRecord.investment_returns) || 0;
        monthly.total_rsa_balance[monthName] = parseFloat(aumRecord.total_rsa_balance) || 0;
        monthly.pfa_fee[monthName] = parseFloat(aumRecord.pfa_fee) || 0;
        monthly.pfc_fee[monthName] = parseFloat(aumRecord.pfc_fee) || 0;
        monthly.pencom_fee[monthName] = parseFloat(aumRecord.pencom_fee) || 0;
        monthly.vat_fee[monthName] = parseFloat(aumRecord.vat_fee) || 0;
        monthly.admin_fee[monthName] = parseFloat(aumRecord.admin_fee) || 0;
        monthly.total_aum[monthName] = parseFloat(aumRecord.total_aum) || 0;
      }
    });

    // Calculate consolidated fees and other derived values
    MONTHS.forEach(month => {
      const pfa = monthly.pfa_fee[month] || 0;
      const pfc = monthly.pfc_fee[month] || 0;
      const pencom = monthly.pencom_fee[month] || 0;
      const vat = monthly.vat_fee[month] || 0;
      monthly.consolidated_fees[month] = pfa + pfc + pencom + vat;
      
      const admin = monthly.admin_fee[month] || 0;
      monthly.vat_admin_fee[month] = admin * 0.075; // 7.5% VAT
    });

    return monthly;
  };

  const calculateTargetAUM = async () => {
    if (!growthPercentage || !selectedFund) {
      toast({ title: "Please enter growth percentage and select a fund", variant: "destructive" });
      return;
    }

    const growth = parseFloat(growthPercentage) / 100;
    const targetTotal = currentYearAUM * (1 + growth);
    const monthlyTarget = targetTotal / 12;

    const newTargetData: MonthlyData = {
      ...currentAUM,
    };

    // Apply growth to each metric
    Object.keys(newTargetData).forEach(metric => {
      MONTHS.forEach(month => {
        const currentValue = currentAUM[metric]?.[month] || 0;
        newTargetData[metric][month] = currentValue * (1 + growth);
      });
    });

    setTargetAUM(newTargetData);
    setEditableTargetData(newTargetData);
    
    toast({ title: "Target AUM calculated successfully" });
  };

  const saveTargetAUM = async () => {
    if (!selectedFund) return;

    try {
      // Get scenario (you might want to make this selectable)
      const { data: scenarios } = await supabase.from("dim_scenario").select("*").eq("is_baseline", true).limit(1);
      const scenarioId = scenarios?.[0]?.scenario_id;

      // Get dates for the target year
      const targetYear = parseInt(dateTo) + 1; // Next year
      const { data: dates } = await supabase
        .from("dim_date")
        .select("*")
        .eq("year", targetYear)
        .order("month");

      if (!dates || !scenarioId) {
        toast({ title: "Could not find dates or scenario", variant: "destructive" });
        return;
      }

      // Delete existing target data for this fund and year
      await supabase
        .from("dim_aum")
        .delete()
        .eq("fund_id", selectedFund)
        .eq("aum_type", "target")
        .in("date_id", dates.map(d => d.date_id));

      // Insert new target data
      const insertData = dates.map((date, index) => {
        const monthName = MONTHS[index];
        return {
          fund_id: selectedFund,
          scenario_id: scenarioId,
          date_id: date.date_id,
          aum_type: 'target',
          new_pin_contribution: editableTargetData.new_pin_contribution?.[monthName] || 0,
          existing_pin_contribution: editableTargetData.existing_pin_contribution?.[monthName] || 0,
          total_contribution: editableTargetData.total_contribution?.[monthName] || 0,
          total_benefits_paid: editableTargetData.payout?.[monthName] || 0,
          net_cash_flow: editableTargetData.net_contribution?.[monthName] || 0,
          investment_returns: editableTargetData.investment_returns?.[monthName] || 0,
          total_rsa_balance: editableTargetData.total_rsa_balance?.[monthName] || 0,
          pfa_fee: editableTargetData.pfa_fee?.[monthName] || 0,
          pfc_fee: editableTargetData.pfc_fee?.[monthName] || 0,
          pencom_fee: editableTargetData.pencom_fee?.[monthName] || 0,
          vat_fee: editableTargetData.vat_fee?.[monthName] || 0,
          admin_fee: editableTargetData.admin_fee?.[monthName] || 0,
          total_aum: editableTargetData.total_aum?.[monthName] || 0,
        };
      });

      const { error } = await supabase.from("dim_aum").insert(insertData);

      if (error) throw error;

      toast({ title: "Target AUM saved successfully" });
    } catch (error: any) {
      toast({ title: "Error saving target AUM", description: error.message, variant: "destructive" });
    }
  };

  const updateTargetCell = (metric: string, month: string, value: string) => {
    setEditableTargetData(prev => ({
      ...prev,
      [metric]: {
        ...prev[metric],
        [month]: parseFloat(value) || 0
      }
    }));
  };

  const calculateRowTotal = (data: { [month: string]: number }) => {
    return MONTHS.reduce((sum, month) => sum + (data[month] || 0), 0);
  };

  const calculateRowAverage = (data: { [month: string]: number }) => {
    const total = calculateRowTotal(data);
    return total / 12;
  };

  const renderAUMTable = (data: MonthlyData, isEditable = false) => {
    const renderRow = (label: string, metric: string, isHeader = false) => {
      const rowData = data[metric] || {};
      return (
        <TableRow key={metric} className={isHeader ? "font-bold bg-muted/50" : ""}>
          <TableCell className="font-medium">{label}</TableCell>
          {MONTHS.map(month => (
            <TableCell key={month} className="text-right">
              {isEditable ? (
                <Input
                  type="number"
                  value={rowData[month] || 0}
                  onChange={(e) => updateTargetCell(metric, month, e.target.value)}
                  className="w-24 text-right"
                />
              ) : (
                (rowData[month] || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })
              )}
            </TableCell>
          ))}
          <TableCell className="text-right font-semibold">
            {calculateRowTotal(rowData).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </TableCell>
          <TableCell className="text-right font-semibold">
            {calculateRowAverage(rowData).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </TableCell>
        </TableRow>
      );
    };

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-48"></TableHead>
              {MONTHS.map(month => (
                <TableHead key={month} className="text-center">{month}</TableHead>
              ))}
              <TableHead className="text-center">TOTAL</TableHead>
              <TableHead className="text-center">AVERAGE</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="bg-muted/30">
              <TableCell colSpan={15} className="font-bold">Contribution</TableCell>
            </TableRow>
            {renderRow("Initial Contribution", "new_pin_contribution")}
            {renderRow("Contribution", "existing_pin_contribution")}
            {renderRow("Payouts", "payout")}
            {renderRow("Net Contribution", "net_contribution", true)}

            <TableRow className="bg-muted/30">
              <TableCell colSpan={15} className="font-bold">Asset Value</TableCell>
            </TableRow>
            {renderRow("Investible Funds", "total_rsa_balance")}
            {renderRow("Returns", "investment_returns")}
            {renderRow("Net Asset Value", "total_rsa_balance", true)}

            <TableRow className="bg-muted/30">
              <TableCell colSpan={15} className="font-bold">Fees</TableCell>
            </TableRow>
            {renderRow("PFA: Asset Management Fee", "pfa_fee")}
            {renderRow("PFC: Asset Management Fee", "pfc_fee")}
            {renderRow("PENCOM: Asset Management Fee", "pencom_fee")}
            {renderRow("VAT", "vat_fee")}
            {renderRow("Consolidated Fees", "consolidated_fees", true)}

            <TableRow className="bg-muted/30">
              <TableCell colSpan={15} className="font-bold">Other Fees</TableCell>
            </TableRow>
            {renderRow("Admin Fee", "admin_fee")}
            {renderRow("VAT on Admin Fee", "vat_admin_fee")}

            <TableRow className="bg-muted/30">
              <TableCell colSpan={15} className="font-bold">Asset Under Management</TableCell>
            </TableRow>
            {renderRow("Opening AUM", "opening_aum")}
            {renderRow("Closing AUM", "total_aum", true)}
          </TableBody>
        </Table>
      </div>
    );
  };

  const currentGrowth = lastYearAUM > 0 
    ? ((currentYearAUM - lastYearAUM) / lastYearAUM * 100).toFixed(2)
    : "0.00";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Assets Under Management</h1>
        <p className="text-muted-foreground mt-1">Track and manage current and target AUM</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Fund Name</Label>
              <Select value={selectedFund} onValueChange={setSelectedFund}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fund" />
                </SelectTrigger>
                <SelectContent>
                  {funds.map(fund => (
                    <SelectItem key={fund.fund_id} value={fund.fund_id}>
                      {fund.fund_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date From</Label>
              <Input
                type="number"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="Year"
              />
            </div>
            <div>
              <Label>Date To</Label>
              <Input
                type="number"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="Year"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Growth Calculator */}
      <Card>
        <CardHeader>
          <CardTitle>AUM Growth Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label>Last Year Total AUM</Label>
              <div className="text-2xl font-bold text-foreground mt-2">
                {lastYearAUM.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <Label>Current Year Total AUM</Label>
              <div className="text-2xl font-bold text-foreground mt-2">
                {currentYearAUM.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <Label>Current Growth</Label>
              <div className="text-2xl font-bold text-primary mt-2">
                {currentGrowth}%
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-4 items-end">
            <div className="flex-1">
              <Label>Target AUM Growth % (Next Year)</Label>
              <Input
                type="number"
                value={growthPercentage}
                onChange={(e) => setGrowthPercentage(e.target.value)}
                placeholder="Enter percentage"
                step="0.01"
              />
            </div>
            <Button onClick={calculateTargetAUM}>Calculate Target AUM</Button>
          </div>
        </CardContent>
      </Card>

      {/* AUM Tables */}
      <Tabs defaultValue="annual" className="space-y-4">
        <TabsList>
          <TabsTrigger value="annual">Annual AUM</TabsTrigger>
          <TabsTrigger value="target">Target AUM Details</TabsTrigger>
        </TabsList>

        <TabsContent value="annual" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Annual AUM</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {renderAUMTable(currentAUM, false)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="target" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Target AUM Details (Editable)</CardTitle>
              <div className="flex gap-2">
                <Button onClick={saveTargetAUM}>
                  Update
                </Button>
                <Button variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {renderAUMTable(editableTargetData, true)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AUM;
