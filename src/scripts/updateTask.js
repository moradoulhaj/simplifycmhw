import * as XLSX from "xlsx";
import JSZip from "jszip";
import { saveAs } from "file-saver"; // For file saving

// Helper function to parse Excel file and extract JSON data
export const parseExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file); // Read the file as ArrayBuffer
  
      reader.onload = (event) => {
        const arrayBuffer = event.target.result;
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
  
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        let data = XLSX.utils.sheet_to_json(sheet);
  
        // Filter out invalid rows
        data = data.filter((row) => {
          // Check if required fields are present and valid
          // For example, checking if a date is present in the 'End_at' column
          const endAt = row.End_at;
  
          // If 'End_at' is missing, empty, or doesn't match the expected format, remove the row
          if (!endAt || typeof endAt !== 'string' || !parseDate(endAt)) {
            return false; // Ignore invalid rows
          }
  
          // Add other validation checks if needed for other columns
          // Example: Ensure a numeric value in a 'TaskId' column
          const taskId = row.TaskId;
          if (!taskId || isNaN(taskId)) {
            return false; // Ignore rows with invalid TaskId
          }
  
          // You can add more checks here based on your data structure
  
          return true; // Keep rows that pass all checks
        });
  
        resolve(data); // Return the filtered data
      };
  
      reader.onerror = () => reject(`Error reading file: ${file.name}`);
    });
  };
  

// Helper function to convert `End_at` string to a JavaScript Date object
const parseDate = (dateStr) => {
    try {
      // Split date and time
      const [dayMonthYear, time] = dateStr.split(" ");
      const [day, month, year] = dayMonthYear.split("/");
  
      // Extract time (hours, minutes, seconds)
      let [hours, minutes, seconds] = time.split(":");
  
      // Return parsed date object
      const dateObj = {
        day: parseInt(day, 10),
        month: parseInt(month, 10),
        year: parseInt(year, 10),
        hours: parseInt(hours, 10),
        minutes: parseInt(minutes, 10),
        seconds: parseInt(seconds, 10),
      };
  
      return dateObj;
    } catch (error) {
      console.error("Error parsing date:", error);
      return null;
    }
  };
  
  
  
// Function to filter tasks based on `End_at`
export const filterTasksByDate = (tasks, currentTime) => {
    return tasks.filter((task) => {
  
      // Parse End_at using parseDate
      const endAt = parseDate(task.End_at);
  
      // Convert parsed date object to a JavaScript Date object for comparison
      const endDate = new Date(endAt.year, endAt.month - 1, endAt.day, endAt.hours, endAt.minutes, endAt.seconds);
  
  
      // Compare parsed date with current time
      return endDate >= currentTime;
    });
  };
  


export const createExcelFilesAndZip = async (filteredDataArray, originalFileNames,entityNum) => {
    const zip = new JSZip();
  
    // Loop through all the filtered data and add them to the zip file
    filteredDataArray.forEach((filteredData, index) => {
      const sheet = XLSX.utils.json_to_sheet(filteredData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, "Updated Tasks");
  
      // Write each workbook as an array
      const excelFile = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  
      // Add the generated Excel file to the zip with a unique filename
      zip.file(`updated_${originalFileNames[index]}.xlsx`, excelFile);
    });
  
    // Generate the zip file and trigger download
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, `updated_tasks_CMH${entityNum}.zip`); // Save the zip file
    });
  };
  