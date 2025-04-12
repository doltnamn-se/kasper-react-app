
import { VersionLog } from "@/hooks/useVersionLogs";
import { format, parseISO } from "date-fns";

// Function to format the release date
const formatReleaseDate = (dateString: string) => {
  try {
    return format(parseISO(dateString), "yyyy-MM-dd");
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

// Export version logs to CSV
export const exportVersionLogsToCSV = (versionLogs: VersionLog[]) => {
  if (!versionLogs || versionLogs.length === 0) {
    console.error("No version logs to export");
    return;
  }

  // CSV headers
  let csvContent = "Version,Release Date,Changes\n";

  // Add data rows
  versionLogs.forEach((log) => {
    const changesList = log.changes
      .map((change) => change.description.replace(/"/g, '""'))
      .join(" | ");
    
    const row = [
      log.version_string,
      formatReleaseDate(log.release_date),
      `"${changesList}"`,
    ].join(",");
    
    csvContent += row + "\n";
  });

  // Create and download CSV file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.setAttribute("href", url);
  link.setAttribute("download", `version_logs_${format(new Date(), "yyyy-MM-dd")}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export version logs to PDF
export const exportVersionLogsToPDF = async (versionLogs: VersionLog[]) => {
  if (!versionLogs || versionLogs.length === 0) {
    console.error("No version logs to export");
    return;
  }

  try {
    // Dynamically import jsPDF to reduce initial bundle size
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Version History", 14, 20);
    
    // Add export date
    doc.setFontSize(10);
    doc.text(`Exported on: ${format(new Date(), "yyyy-MM-dd")}`, 14, 30);
    
    let yPosition = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add version logs
    versionLogs.forEach((log) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Add version number and date
      doc.setFontSize(14);
      doc.text(`${log.version_string} (${formatReleaseDate(log.release_date)})`, 14, yPosition);
      yPosition += 7;
      
      // Add changes
      doc.setFontSize(10);
      log.changes.forEach((change) => {
        // Split long texts to fit page width
        const textLines = doc.splitTextToSize(change.description, pageWidth - 30);
        
        textLines.forEach((line: string) => {
          // Check if we need a new page
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.text(`• ${line}`, 18, yPosition);
          yPosition += 6;
        });
      });
      
      yPosition += 10; // Add space between version entries
    });
    
    // Save PDF
    doc.save(`version_logs_${format(new Date(), "yyyy-MM-dd")}.pdf`);
  } catch (error) {
    console.error("Failed to generate PDF:", error);
  }
};
