import React, { useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import JSZip from "jszip";

import FileList from "./smalls/FilesList";
import { Download, Plus, RotateCcw, Trash2, Upload } from "lucide-react";

import TagsInput from "./smalls/TagsInput";
import { saveAs } from "file-saver";

import { downloadProcessedContent } from "../scripts/scripts";
import {
  calcSessions,
  collectData,
  parseNumberTagPairs,
} from "../scripts/spliterScripts";
import { processData, processExcelFiles } from "../scripts/ramadanTask";
import EntitySelector from "./smalls/EntitySelector";

export default function RamadanTask() {
  const [oldFiles, setOldFiles] = useState([]);
  const [processedContents, setProcessedContents] = useState([]);
  const [tagsToAdd, setTagsToAdd] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const oldFileInputRef = useRef(null);
  const [entityName, setEntityName] = useState("");

  const HandleReset = () => {
    setOldFiles([]);
    setProcessedContents([]);
    setTagsToAdd("");
  };

  const handleAddTags = async () => {
    if (!tagsToAdd) {
      toast.error("Please specify tags to Add.");
      return;
    } else if (!oldFiles.length) {
      toast.error("Please upload files.");
      return;
    } else if (entityName === "") {
      toast.error("Name your entity.");
      return;
    }

    // Taking the first line of the input
    const firstLine = tagsToAdd.split("\n")[0];

    // then passing the first line to return the number of sessions
    const sessionsNumber = calcSessions(firstLine) - 0.5;

    if (sessionsNumber === 0) {
      toast.error("No sessions");
      return;
    } else if (oldFiles.length !== sessionsNumber) {
      toast.error("Number of files and sessions do not match");
      return;
    }

    // Now I will need to remove the first column in the input
    const { nextDay, onlyTags } = processData(tagsToAdd);

    const lines = onlyTags.split("\n").map((line) => parseNumberTagPairs(line));

    const collectedData = await collectData(lines, sessionsNumber);

    if (collectedData === "wrongInput") {
      return;
    }

    // Process Excel files and prepare downloads
    const updatedFiles = await processExcelFiles(oldFiles, collectedData);

    // Create a new zip instance
    const zip = new JSZip();

    // Add each processed file to the zip
    updatedFiles.forEach(({ blob, fileName }) => {
      zip.file(fileName, blob);
    });

    // Generate the zip file
    zip.generateAsync({ type: "blob" }).then((content) => {
      // Save the zip file
      saveAs(content, `TaskWithLogin[${nextDay}]-CMH${entityName}.zip`);
    });

    toast.success("Files processed and zipped successfully!");
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
        ADD LOGIN FOR THE NEXT DAY
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
      <EntitySelector entityName={entityName} setEntityName={setEntityName} placeholder="Entity number"/>

 

      <div className="flex flex-col items-center mt-4 w-full max-w-lg">
        <TagsInput
          tagsToRemove={tagsToAdd}
          setTagsToRemove={setTagsToAdd}
          setProcessedContents={setProcessedContents}
          // Suggested code may be subject to a license. Learn more: ~LicenseLog:3127348425.
          content={"Tags to Add"}
        />
      </div>

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
          onClick={handleAddTags}
          className={`flex items-center gap-2 px-6 py-3 
    bg-gradient-to-r from-blue-500 to-blue-600 text-white 
    rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 
    transition-all duration-200 font-medium ${
      processedContents.length ? "hidden" : ""
    }`}
        >
          <Plus className="w-5 h-5" />
          Add Task
        </button>

        <button
          className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
            !processedContents.length ? "hidden" : ""
          }`}
          onClick={() => {
            downloadProcessedContent(processedContents);
          }}
          disabled={!processedContents.length}
        >
          <Download className="w-5 h-5" />
          Download Files
        </button>
      </div>
    </div>
  );
}
