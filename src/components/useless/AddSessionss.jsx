import React, { useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  downloadProcessedContent,
  readFileContent,
} from "../../scripts/scripts";
import FileList from "../smalls/FilesList";
import TagsInput from "../smalls/TagsInput";
export default function AddSessionWithTags() {
  const [oldFiles, setOldFiles] = useState([]);
  const [processedFiles, setprocessedFiles] = useState([]); // State to hold processed content
  const [tagsToAdd, setTagsToAdd] = useState("");
  const [startingDropNbr, setStartingDropNbr] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  const oldFileInputRef = useRef(null);

  const handleOldFileUpload = (event) => {
    setOldFiles(Array.from(event.target.files));
  };

  const processFiles = async () => {
    const tags = tagsToAdd
      .split("\n")
      .map((tag) => tag.trim())
      .filter((tag) => tag); // Split by new line and trim

    let lastFile = oldFiles.at(-1);
    const match = lastFile.name.match(/file_(\d+)/);
    const lastFileIndex = match ? parseInt(match[1]) : -1;
    let dropsToAdd = lastFileIndex - startingDropNbr + 1;

    // Split tags across each drop for each file
    const tagsPerDrop = Math.floor(tags.length / dropsToAdd);
    const remainder = tags.length % dropsToAdd;

    // Array to store tags for each drop
    const tagsByDrop = [];
    let startIndex = 0;
    for (let i = 0; i < dropsToAdd; i++) {
      const endIndex =
        startIndex + tagsPerDrop + (i === dropsToAdd - 1 ? remainder : 0); // Add remainder to the last drop
      const dropTags = tags.slice(startIndex, endIndex);
      tagsByDrop.push(dropTags);
      startIndex = endIndex;
    }
    const modifiedFiles = await Promise.all(
      oldFiles.map(async (file, index) => {
        const match = file.name.match(/file_(\d+)/);
        const fileIndex = match ? parseInt(match[1]) : -1;
        if (fileIndex < startingDropNbr) {
          const content = await readFileContent(file);
          return { name: file.name, content: content };
        } else {
          const content = await readFileContent(file);
          const indexToAdd = fileIndex - startingDropNbr;
          const tagsToAppend = tagsByDrop[indexToAdd] || []; // Get tags for the current drop
          const modifiedContent = `${content}\n${tagsToAppend.join("\n")}`; // Append tags to content
          return { name: file.name, content: modifiedContent };
        }
      })
    );
    setprocessedFiles(modifiedFiles);
    toast.success("Tags added successfully!");
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

      <div className="flex flex-col items-center mt-4">
        <DelimiterSelector
          delimiter={delimiter}
          setDelimiter={setDelimiter}
          setProcessedContents={setProcessedContents}
        />
      </div>

      <div className="flex flex-col items-center mt-4 w-full max-w-lg">
        <TagsInput
          tagsToRemove={tagsToRemove}
          setTagsToRemove={setTagsToRemove}
          setProcessedContents={setProcessedContents}
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
            downloadProcessedContent(processedContents);
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
