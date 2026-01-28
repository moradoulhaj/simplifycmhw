export const processData = (input) => {
  const lines = input.trim().split("\n"); // Split into lines and trim whitespace

  if (lines.length === 0) return { nextDay: null, onlyTags: "" }; // Edge case

  const nextDay = lines[0].split("\t")[0]; // Extract first number from first row

  const onlyTags = lines
    .map((line) => line.split("\t").slice(1).join("\t")) // Remove first column
    .join("\n"); // Reconstruct data

  return { nextDay, onlyTags };
};

import { toast } from "react-toastify";
import * as XLSX from "xlsx";

export const processExcelFiles = (files, seedsBySessions) => {
  const now = new Date();
  now.setDate(now.getDate() + 1); // Tomorrow
  now.setHours(9, 0, 0, 0); // Start at 09:00 AM

  const startTime = new Date(now);
  const endTime = new Date(now);
  endTime.setHours(13, 0, 0, 0); // End at 13:00 PM

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const period = date.getHours() >= 12 ? "PM" : "AM";
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${period}`;
  };

  const processedFiles = files.map((file, index) => {
    const newProfiles =
      seedsBySessions[index]?.map((item) => item[0]).join("|") || "Not_found";

    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        let jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length === 0) {
          toast.error(`Skipping empty file: ${file.name}`);
          return resolve(null);
        }

        if (newProfiles === "Not_found") {
          toast.info(`No seeds found for session number: ${index + 1}`);

          // 🔹 Return original file as it was
          return resolve({ blob: file, fileName: `Updated_${file.name}` });
        }
        // Remove the file extension
        const baseName = file.name.replace(/\.xlsx$/, "");

        // Extract the session name (everything after the first "_")
        const admin = baseName.substring(baseName.indexOf("_") + 1);

        // const admin = jsonData[2]?.[1] || "admin_3";
        const lastRow = jsonData[jsonData.length - 1];
        const newRowNumber = parseInt(lastRow[0]) + 1 || 1;

        const newStartTime = formatDate(startTime);
        const newEndTime = formatDate(endTime);

        const newRow = [
          25,
          admin,
          "Login_Gmail.js",
          newProfiles,
          newStartTime,
          newEndTime,
          "check_status",
          1,
          `Drop ${newStartTime.split(" ")[1]}`,
        ];

        jsonData.splice(25, 0, newRow);

        const newWorksheet = XLSX.utils.aoa_to_sheet(jsonData);
        const newWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, sheetName);

        const excelBuffer = XLSX.write(newWorkbook, {
          bookType: "xlsx",
          type: "array",
        });
        const blob = new Blob([excelBuffer], {
          type: "application/octet-stream",
        });

        resolve({ blob, fileName: `Updated_${file.name}` });
      };

      reader.readAsArrayBuffer(file);
    });
  });

  return Promise.all(processedFiles);
};
