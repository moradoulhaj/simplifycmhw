import React, { useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import FileList from "./smalls/FilesList";
import { Plus, RotateCcw, Trash2, Upload } from "lucide-react";



import EntitySelector from "./smalls/EntitySelector";
import {
  createExcelFilesAndZip,
  filterTasksByDate,
  parseExcelFile,
} from "../scripts/updateTask";

export default function UpdateTask() {
  const [oldFiles, setOldFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const oldFileInputRef = useRef(null);
  const [entityName, setEntityName] = useState("");
  const [processedContents , setProcessedContents] = useState([]);

  const HandleReset = () => {
    setOldFiles([]);
    setProcessedContents([]);
  };

  // Main function to process and update tasks
  const updateTask = async (oldFiles, setProcessedContents) => {
    if (oldFiles.length === 0) {
      toast.error("Please upload at least one Excel file.");
      return;
    }
  
    const now = new Date();
  
    let filteredDataArray = [];
    let originalFileNames = [];
  
    for (const file of oldFiles) {
      try {
        const data = await parseExcelFile(file);
  
        const filteredData = filterTasksByDate(data, now);
  
        if (filteredData.length > 0) {
          filteredDataArray.push(filteredData);
          originalFileNames.push(file.name);
        }
      } catch (error) {
        toast.error(error);
      }
    }
  
    // If we have valid filtered data, zip and download the files
    if (filteredDataArray.length > 0) {
      // Call the function to zip and download all updated files
      createExcelFilesAndZip(filteredDataArray, originalFileNames, entityName);
      
      toast.success("Tasks updated successfully!");
    } else {
      toast.warning("No valid tasks remaining.");
    }
  };

  const handleOldFileUpload = (event) => {
    setOldFiles(Array.from(event.target.files));
    setProcessedContents([]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files);
    setOldFiles(files); // Replace old files with dropped files
    setProcessedContents([]); // Clear processed contents
  };

  return (
    <div
      className="flex flex-col items-center p-10 space-y-8 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 min-h-screen"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <ToastContainer theme="colored" />
      <h2 className="text-4xl font-extrabold text-blue-800 drop-shadow-lg">
        Remove Timed out Tasks from Excel
      </h2>

      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div>
          <input
            type="file"
            accept=".xlsx"
            multiple
            ref={oldFileInputRef}
            onChange={(e) => {
              handleOldFileUpload(e);
              setOldFiles(Array.from(e.target.files)); // Replace dropped files with uploaded files
            }}
            style={{ display: "none" }}
          />
          <button
            className="w-full group relative flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
            onClick={() => oldFileInputRef.current.click()}
          >
            <Upload className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            <span className="font-medium">Upload EXCELS</span>
          </button>
        </div>
        <div>
          <button
            onClick={HandleReset}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg hover:scale-105 border border-blue-600 transition-transform transition-colors duration-200 font-medium"
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </button>
        </div>
      </div>
      <EntitySelector
        entityName={entityName}
        setEntityName={setEntityName}
        placeholder="Entity number"
      />

      <div
        className={`flex flex-col md:flex-row gap-10 w-full max-w-lg md:justify-center mt-6 ${
          isDragging ? "border-2 border-blue-500" : ""
        }`}
      >
        <FileList
          files={oldFiles}
          titre={"Uploaded Files"}
          setOldFiles={setOldFiles}
          setProcessedContents={setProcessedContents}
        />
      </div>

      <div className="flex gap-6 mt-6">
        <button
          onClick={() => updateTask(oldFiles, setProcessedContents)}
          className={`flex items-center gap-2 px-6 py-3 
    bg-gradient-to-r from-blue-500 to-blue-600 text-white 
    rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 
    transition-all duration-200 font-medium`}
        >
          <Plus className="w-5 h-5" />
          Update Task
        </button>

      </div>
    </div>
  );
}
