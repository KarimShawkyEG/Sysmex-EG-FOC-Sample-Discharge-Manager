import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/dashboard/DataTable';
import { exportToPDF, exportToExcel, ExportData } from '@/utils/exportUtils';
import { LogOut, Download, FileText, FileSpreadsheet, Database, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const tables = [
  { name: 'Invoice_Log', displayName: 'Invoice Log' },
  { name: 'client_list', displayName: 'Client List' },
  { name: 'product_list', displayName: 'Product List' },
  { name: 'seller_list', displayName: 'Seller List' }
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tableData, setTableData] = useState<Record<string, any[]>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string>(tables[0].name);

  const handleDataChange = (tableName: string, data: any[]) => {
    setTableData(prev => ({
      ...prev,
      [tableName]: data
    }));
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      setIsExporting(true);
      
      const exportData: ExportData[] = tables
        .filter(table => tableData[table.name] && tableData[table.name].length > 0)
        .map(table => ({
          tableName: table.displayName,
          data: tableData[table.name],
          columns: tableData[table.name].length > 0 ? Object.keys(tableData[table.name][0]) : []
        }));

      if (exportData.length === 0) {
        toast({
          title: "No Data to Export",
          description: "Please wait for the data to load before exporting",
          variant: "destructive"
        });
        return;
      }

      if (format === 'pdf') {
        exportToPDF(exportData);
        toast({
          title: "PDF Export Complete",
          description: "Your database report has been downloaded as PDF"
        });
      } else {
        exportToExcel(exportData);
        toast({
          title: "Excel Export Complete", 
          description: "Your database report has been downloaded as Excel"
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting the data",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Database Management Dashboard</h1>
                <p className="text-muted-foreground text-sm sm:text-base">Real-time database monitoring and export tools</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Welcome, {user?.full_name || user?.username}</span>
                <span className="sm:hidden">{user?.full_name || user?.username}</span>
              </div>
              <Button onClick={logout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Export Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export All Tables
            </CardTitle>
            <CardDescription>
              Download all table data as PDF or Excel format, or export individual tables using the buttons on each table
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => handleExport('pdf')} 
                disabled={isExporting}
                variant="outline"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export All as PDF
              </Button>
              <Button 
                onClick={() => handleExport('excel')} 
                disabled={isExporting}
                variant="outline"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export All as Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        
        {/* Table Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Select Table to View
            </CardTitle>
            <CardDescription>
              Choose which table to display below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select a table" />
              </SelectTrigger>
              <SelectContent>
                {tables.map((table) => (
                  <SelectItem key={table.name} value={table.name}>
                    {table.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Selected Table */}
        <div className="w-full">
          {tables
            .filter(table => table.name === selectedTable)
            .map((table) => (
              <DataTable
                key={table.name}
                tableName={table.name}
                displayName={table.displayName}
                onDataChange={(data) => handleDataChange(table.name, data)}
              />
            ))}
        </div>
      </main>
    </div>
  );
}