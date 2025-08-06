import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface ExportData {
  tableName: string;
  data: any[];
  columns: string[];
}

export const exportToPDF = (exportData: ExportData[]) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text('Database Export Report', 20, 20);
  
  // Add timestamp
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
  
  let currentY = 50;
  
  exportData.forEach((table, index) => {
    if (index > 0) {
      doc.addPage();
      currentY = 20;
    }
    
    // Table title
    doc.setFontSize(14);
    doc.text(table.tableName, 20, currentY);
    currentY += 10;
    
    // Create table
    autoTable(doc, {
      head: [table.columns],
      body: table.data.map(row => 
        table.columns.map(col => {
          const value = row[col];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          return String(value);
        })
      ),
      startY: currentY,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
      margin: { top: 10 }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 20;
  });
  
  doc.save(`database-export-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportToExcel = (exportData: ExportData[]) => {
  const workbook = XLSX.utils.book_new();
  
  exportData.forEach(table => {
    // Convert data to worksheet format
    const worksheetData = [
      table.columns,
      ...table.data.map(row => 
        table.columns.map(col => {
          const value = row[col];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          return value;
        })
      )
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Auto-size columns
    const colWidths = table.columns.map(col => ({
      wch: Math.max(col.length, 15)
    }));
    worksheet['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(workbook, worksheet, table.tableName);
  });
  
  XLSX.writeFile(workbook, `database-export-${new Date().toISOString().split('T')[0]}.xlsx`);
};