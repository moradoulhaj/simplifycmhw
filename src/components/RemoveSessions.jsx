import React, { useState, useRef ,useEffect} from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmModal from "./smalls/ConfirmModal";
import FileList from "./smalls/FilesList";
import { Download, RotateCcw, Trash2, Upload } from "lucide-react";
import DelimiterSelector from "./smalls/DelimiterSelector";
import TagsInput from "./smalls/TagsInput";
import {
  detectSeparator,
  downloadProcessedContent,
  readFileContent,
} from "../scripts/scripts";
import EntitySelector from "./smalls/EntitySelector";

export default function RemoveSessions() {
  const [oldFiles, setOldFiles] = useState([]);
  const [processedContents, setProcessedContents] = useState([]);
  const [tagsToRemove, setTagsToRemove] = useState("");
  const [delimiter, setDelimiter] = useState("AUTO");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [separator, setSeparator] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const oldFileInputRef = useRef(null);
  const [entityName, setEntityName] = useState("");
  const HandleReset = () => {
    setOldFiles([]);
    setProcessedContents([]);
    setTagsToRemove("");
    setDelimiter("AUTO");
    setIsModalOpen(false);
    setSeparator("");
  };
  
  const handleRemoveTags = async () => {
    if (!tagsToRemove) {
      toast.error("Please specify tags to remove.");
      return;
    } else if (!oldFiles.length) {
      toast.error("Please upload files.");
      return;
    }
    if (delimiter === "AUTO") {
      setIsModalOpen(true);
      setSeparator(await detectSeparator(oldFiles));
      return;
    } else {
      processFiles(delimiter);
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

  const removeTags = async (content, tagsArray, delimiter) => {
    tagsArray.forEach((tag) => {
      content = content.split(tag).join("");
    });

    const cleanedContentArray = content
      .split("\n")
      .map((line) =>
        line
          .split(delimiter)
          .map((item) => item.trim())
          .filter((item) => item)
          .join(delimiter)
      )
      .filter((line) => line.trim() !== "");

    return cleanedContentArray.join("\n").trim();
  };

  const handleConfirmSeparator = () => {
    setIsModalOpen(false);
    processFiles(separator);
  };

  const handleCancelSeparator = () => {
    setIsModalOpen(false);
  };

  const processFiles = async (separatoor) => {
    const tags = tagsToRemove
      .split("\n")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    const fileProcesses = oldFiles.map((file) =>
      readFileContent(file).then((content) => ({
        name: file.name,
        content: removeTags(content, tags, separatoor),
      }))
    );

    Promise.all(fileProcesses)
      .then((results) => {
        setProcessedContents(results);
        toast.success("Tags removed successfully!");
      })
      .catch((error) => console.error("Error processing files:", error));
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
        Remove Tags from Uploaded Text Files
      </h2>

      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div>
          <input
            type="file"
            accept=".txt"
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
            <span className="font-medium">Upload Text Files</span>
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
      <div className="flex justify-center items-center gap-4 mt-4">
        <div className="flex flex-col items-center mt-4">
          <DelimiterSelector
            delimiter={delimiter}
            setDelimiter={setDelimiter}
            setProcessedContents={setProcessedContents}
            name={"normal"}
          />
        </div>
        <div className="flex flex-col items-center mt-4">
          <EntitySelector
            entityName={entityName}
            setEntityName={setEntityName}
          />
        </div>
      </div>

      <div className="flex flex-col items-center mt-4 w-full max-w-lg">
        <TagsInput
          tagsToRemove={tagsToRemove}
          setTagsToRemove={setTagsToRemove}
          setProcessedContents={setProcessedContents}
          // Suggested code may be subject to a license. Learn more: ~LicenseLog:3127348425.
          content={"Tags to remove"}
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
          onClick={handleRemoveTags}
          className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium ${
            processedContents.length ? "hidden" : ""
          }`}
        >
          <Trash2 className="w-5 h-5" />
          Remove Tags
        </button>
        <button
          className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
            !processedContents.length ? "hidden" : ""
          }`}
          onClick={() => {
            downloadProcessedContent(processedContents,null, entityName);
          }}
          
          disabled={!processedContents.length}
        >
          <Download className="w-5 h-5" />
          Download Files
        </button>
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        separator={separator}
        onConfirm={handleConfirmSeparator}
        onCancel={handleCancelSeparator}
      />
    </div>
  );
}
