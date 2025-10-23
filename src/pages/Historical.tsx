import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileSpreadsheet, Download, Printer } from "lucide-react";
import { toast } from "sonner";

const Historical = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
                <CardTitle>Historical Income Statement</CardTitle>
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
              <div className="text-center py-12 text-muted-foreground">
                No data uploaded yet. Upload an Excel file to view income statements.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Historical Balance Sheet</CardTitle>
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
              <div className="text-center py-12 text-muted-foreground">
                No data uploaded yet. Upload an Excel file to view balance sheets.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="managed" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Monthly Managed Fund Historical</CardTitle>
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
              <div className="text-center py-12 text-muted-foreground">
                No data uploaded yet. Upload an Excel file to view managed fund data.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rsa" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>RSA Fund Historical</CardTitle>
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
              <div className="text-center py-12 text-muted-foreground">
                No data uploaded yet. Upload an Excel file to view RSA fund data.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Historical;
