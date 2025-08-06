import { useState, useEffect } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import {
	Loader2,
	RefreshCw,
	Database,
	Search,
	FileText,
	FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { exportToPDF, exportToExcel, ExportData } from "@/utils/exportUtils";

interface DataTableProps {
	tableName: string;
	displayName: string;
	onDataChange?: (data: any[]) => void;
}

export function DataTable({
	tableName,
	displayName,
	onDataChange,
}: DataTableProps) {
	const [data, setData] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [columns, setColumns] = useState<string[]>([]);
	const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [filteredData, setFilteredData] = useState<any[]>([]);
	const [isExporting, setIsExporting] = useState(false);

	const fetchData = async () => {
		try {
			setLoading(true);
			setError(null);

			// Use type assertion to handle dynamic table names
			const { data: tableData, error: fetchError } = await supabase
				.from(tableName as any)
				.select("*");

			if (fetchError) {
				throw fetchError;
			}

			setData(tableData || []);
			setFilteredData(tableData || []);

			// Extract columns from first row
			if (tableData && tableData.length > 0) {
				const allColumns = Object.keys(tableData[0]);
				const restColumns = allColumns.slice(0, -1); // removes the last item
				setColumns(restColumns);
			}

			setLastUpdated(new Date());
			onDataChange?.(tableData || []);
		} catch (err: any) {
			console.error("Error fetching data:", err);
			setError(err.message || "Failed to fetch data");
			toast({
				title: "Error Loading Data",
				description: `Failed to load ${displayName}: ${err.message}`,
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();

		// Set up real-time subscription
		let channel: RealtimeChannel;

		try {
			channel = supabase
				.channel(`${tableName}-changes`)
				.on(
					"postgres_changes",
					{
						event: "*", // Listen to all changes (INSERT, UPDATE, DELETE)
						schema: "public",
						table: tableName,
					},
					(payload) => {
						console.log(`Real-time update for ${tableName}:`, payload);
						fetchData(); // Refresh data on any change
						toast({
							title: "Data Updated",
							description: `${displayName} has been updated in real-time`,
						});
					}
				)
				.subscribe();
		} catch (err) {
			console.error("Error setting up real-time subscription:", err);
		}

		return () => {
			if (channel) {
				supabase.removeChannel(channel);
			}
		};
	}, [tableName]);

	const formatCellValue = (value: any): string => {
		if (value === null || value === undefined) return "-";
		if (typeof value === "boolean") return value ? "Yes" : "No";
		if (typeof value === "object") return JSON.stringify(value);
		if (
			typeof value === "string" &&
			value.includes("T") &&
			value.includes(":")
		) {
			// Likely a timestamp
			try {
				return new Date(value).toLocaleString();
			} catch {
				return value;
			}
		}
		return String(value);
	};

	// Filter data based on search term
	useEffect(() => {
		if (!searchTerm.trim()) {
			setFilteredData(data);
			return;
		}

		const filtered = data.filter((row) => {
			const firstColumnValue = columns.length > 0 ? row[columns[0]] : "";
			return String(firstColumnValue)
				.toLowerCase()
				.includes(searchTerm.toLowerCase());
		});
		setFilteredData(filtered);
	}, [searchTerm, data, columns]);

	const handleExportTable = async (format: "pdf" | "excel") => {
		try {
			setIsExporting(true);

			if (filteredData.length === 0) {
				toast({
					title: "No Data to Export",
					description: "No data available for export",
					variant: "destructive",
				});
				return;
			}

			const exportData: ExportData[] = [
				{
					tableName: displayName,
					data: filteredData,
					columns: columns,
				},
			];

			if (format === "pdf") {
				exportToPDF(exportData);
				toast({
					title: "PDF Export Complete",
					description: `${displayName} has been downloaded as PDF`,
				});
			} else {
				exportToExcel(exportData);
				toast({
					title: "Excel Export Complete",
					description: `${displayName} has been downloaded as Excel`,
				});
			}
		} catch (error) {
			console.error("Export error:", error);
			toast({
				title: "Export Failed",
				description: "An error occurred while exporting the data",
				variant: "destructive",
			});
		} finally {
			setIsExporting(false);
		}
	};

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Database className="w-5 h-5" />
						{displayName}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center py-8">
						<Loader2 className="w-6 h-6 animate-spin mr-2" />
						<span>Loading {displayName.toLowerCase()}...</span>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Database className="w-5 h-5" />
						{displayName}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8">
						<p className="text-destructive mb-4">Error loading data: {error}</p>
						<Button onClick={fetchData} variant="outline" size="sm">
							<RefreshCw className="w-4 h-4 mr-2" />
							Retry
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<Database className="w-5 h-5" />
							{displayName}
						</CardTitle>
						<CardDescription>
							{filteredData.length} of {data.length} record
							{data.length !== 1 ? "s" : ""} • Last updated:{" "}
							{lastUpdated.toLocaleTimeString()}
						</CardDescription>
					</div>
					<div className="flex items-center gap-2">
						<Badge variant="secondary">{filteredData.length}</Badge>
						<Button
							onClick={() => handleExportTable("pdf")}
							disabled={isExporting || filteredData.length === 0}
							variant="outline"
							size="sm"
						>
							<FileText className="w-4 h-4" />
						</Button>
						<Button
							onClick={() => handleExportTable("excel")}
							disabled={isExporting || filteredData.length === 0}
							variant="outline"
							size="sm"
						>
							<FileSpreadsheet className="w-4 h-4" />
						</Button>
						<Button onClick={fetchData} variant="outline" size="sm">
							<RefreshCw className="w-4 h-4" />
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{/* Search Input */}
				<div className="mb-4 flex items-center gap-2">
					<Search className="w-4 h-4 text-muted-foreground" />
					<Input
						placeholder={`Search by ${
							columns[0]?.replace(/_/g, " ") || "ID"
						}...`}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="max-w-sm"
					/>
				</div>

				{data.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						No data available in {displayName.toLowerCase()}
					</div>
				) : filteredData.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						{searchTerm
							? `No records found matching "${searchTerm}"`
							: "No data available"}
					</div>
				) : (
					<div className="rounded-md border overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									{columns.map((column) => (
										<TableHead
											key={column}
											className="font-semibold whitespace-nowrap min-w-[120px]"
										>
											{column
												.replace(/_/g, " ")
												.replace(/\b\w/g, (l) => l.toUpperCase())}
										</TableHead>
									))}
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredData.map((row, index) => (
									<TableRow key={row.id || index}>
										{columns.map((column) => (
											<TableCell
												key={column}
												className="whitespace-nowrap min-w-[120px] max-w-[200px] truncate"
											>
												{formatCellValue(row[column])}
											</TableCell>
										))}
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
