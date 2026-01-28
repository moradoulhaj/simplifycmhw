import React, { useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  downloadProcessedContent,
  readFileContent,
} from "../../scripts/scripts";
import FileList from "./FilesList";
import TagsInput from "./TagsInput";
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
    <div className="flex flex-col items-center p-8 space-y-6 bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 min-h-screen">
      <ToastContainer />
      <h2 className="text-4xl font-extrabold text-blue-700 drop-shadow-md tracking-wide">
        Add Session Using Tags
      </h2>

      <div className="flex flex-col md:flex-row gap-10 items-center">
        <div className="flex flex-col items-center">
          <input
            type="file"
            accept=".txt"
            multiple
            ref={oldFileInputRef}
            onChange={handleOldFileUpload}
            style={{ display: "none" }}
          />
          <button
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold"
            onClick={() => oldFileInputRef.current.click()}
          >
            Upload Files
          </button>
        </div>
        <div className="flex items-center">
          <label className="text-lg font-medium text-gray-800 mb-2">
            Starting from:
          </label>
          <input
            type="number"
            value={startingDropNbr}
            onChange={(e) => setStartingDropNbr(e.target.value)}
            className="w-24 border border-gray-300 rounded-md px-4 py-2 text-center text-gray-700 shadow-md focus:outline-none focus:border-blue-400"
            min="1"
          />
        </div>
      </div>

      <div className="flex flex-col items-center mt-6 w-full">
        <div className="w-full max-w-lg">
          <TagsInput
            tagsToRemove={tagsToAdd}
            setTagsToRemove={setTagsToAdd}
            setProcessedContents={setprocessedFiles}
          />
        </div>

        <div
          className={`flex flex-col md:flex-row gap-10 w-full max-w-lg mt-8 ${
            isDragging ? "border-2 border-blue-500 rounded-lg" : ""
          }`}
        >
          <FileList
            files={oldFiles}
            titre={"Uploaded Files"}
            setOldFiles={setOldFiles}
            setProcessedContents={setprocessedFiles}
          />
        </div>
      </div>

      <div className="flex gap-6 mt-8">
        <button
          className="px-6 py-3 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600 transition-all duration-200 font-medium"
          onClick={processFiles}
        >
          Remove Rdp
        </button>
        <button
          className="px-6 py-3 bg-purple-500 text-white rounded-lg shadow-md hover:bg-purple-600 transition-all duration-200 font-medium"
          onClick={() => {
            downloadProcessedContent(processedFiles);
          }}
        >
          Download Files
        </button>
      </div>
    </div>
  );
}
