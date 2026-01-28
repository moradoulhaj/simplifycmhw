import React, { useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, RotateCcw, Upload } from "lucide-react";
import ConfirmModal from "./smalls/ConfirmModal";
import FileList from "./smalls/FilesList";
import DelimiterSelector from "./smalls/DelimiterSelector";
import FileViewer from "./smalls/FileViewer";
import { detectSeparator, handleExcel, readFileContent } from "../scripts/scripts";

export default function Offers() {
  const [oldFiles, setOldFiles] = useState([]);
  const [processedContents, setProcessedContents] = useState([]);
  const [delimiter, setDelimiter] = useState("AUTO");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [separator, setSeparator] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const oldFileInputRef = useRef(null);

  const handleReset = () => {
    setOldFiles([]);
    setProcessedContents([]);
    setDelimiter("AUTO");
    setIsModalOpen(false);
    setSeparator("");
    setCurrentPage(0);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    setOldFiles(files);
    setProcessedContents([]);
    toast.success(`${files.length} file(s) uploaded.`);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files);
    if (files.length === 0) return;
    setOldFiles(files);
    setProcessedContents([]);
    toast.success(`${files.length} file(s) dropped.`);
  };

  const handleDisplayTags = async () => {
    if (oldFiles.length === 0) {
      toast.error("Please upload at least one file.");
      return;
    }
    if (delimiter === "AUTO") {
      const detectedSeparator = await detectSeparator(oldFiles);
      setSeparator(detectedSeparator);
      setIsModalOpen(true);
    } else {
      processFiles(delimiter);
    }
  };

  const processFiles = async (separator) => {
    try {
      const results = await Promise.all(
        oldFiles.map(async (file) => ({
          name: file.name,
          content: (await readFileContent(file)).replace(/;/g, "\n"),
        }))
      );
      setProcessedContents(results);
      toast.success("Files processed successfully!");
    } catch (error) {
      console.error("Error processing files:", error);
      toast.error("Error processing files.");
    }
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
        Read And Display File's Content
      </h2>

      {/* Upload & Reset Buttons */}
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <input
          type="file"
          accept=".txt"
          multiple
          ref={oldFileInputRef}
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />
        <button
          className="group flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all"
          onClick={() => oldFileInputRef.current.click()}
        >
          <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Upload Text Files</span>
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all"
        >
          <RotateCcw className="w-5 h-5" />
          Reset
        </button>
      </div>

      {/* Delimiter Selector */}
      <DelimiterSelector
        delimiter={delimiter}
        setDelimiter={setDelimiter}
        setProcessedContents={setProcessedContents}
        name="normal"
      />

      {/* Uploaded Files List */}
      <div
        className={`flex flex-col md:flex-row gap-10 w-full max-w-lg md:justify-center mt-6 ${
          isDragging ? "border-2 border-blue-500" : ""
        }`}
      >
        <FileList
          files={oldFiles}
          titre="Uploaded Files"
          setOldFiles={setOldFiles}
          setProcessedContents={setProcessedContents}
        />
      </div>

      {/* Action Buttons */}
      
        <div className="flex justify-center gap-10 mt-6">
          <button
            onClick={handleDisplayTags}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-lg hover:from-red-600 hover:to-red-700 transition-all"
          >
            <Eye className="w-5 h-5" />
            Read Files
          </button>
          <button
            onClick={() => handleExcel(processedContents)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-600 text-white rounded-lg shadow-lg hover:from-green-600 hover:to-green-700 transition-all"
          >
            <Eye className="w-5 h-5" />
            Generate Excel
          </button>
        </div>
   
        <div className="w-full max-w-4xl mt-6 p-4 border border-gray-300 rounded-lg">
          <FileViewer
            processedContents={processedContents}
            currentPage={currentPage}
            handlePreviousFile={() =>
              setCurrentPage((prev) => Math.max(prev - 1, 0))
            }
            handleNextFile={() =>
              setCurrentPage((prev) =>
                Math.min(prev + 1, processedContents.length - 1)
              )
            }
          />
        </div>
  

      {/* Separator Confirmation Modal */}
      <ConfirmModal
        isOpen={isModalOpen}
        separator={separator}
        onConfirm={() => {
          setIsModalOpen(false);
          processFiles(separator);
        }}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
}
