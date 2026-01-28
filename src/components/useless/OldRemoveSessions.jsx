import React, { useState, useRef, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import JSZip from "jszip";
import ConfirmModal from "./ConfirmModal";
import FileList from "./FilesList";
import { Download, Trash2 } from "lucide-react";

export default function RemoveSessions() {
  const [oldFiles, setOldFiles] = useState([]);
  const [processedContents, setProcessedContents] = useState([]); // State to hold processed content
  const [tagsToRemove, setTagsToRemove] = useState("");
  const [delimiter, setDelimiter] = useState("AUTO");
  const [detectedSeparator, setDetectedSeparator] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const oldFileInputRef = useRef(null);

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };
  // function to detect separator
  const detectSeparator = async () => {
    if (oldFiles.length > 0) {
      const fileContent = await readFileContent(oldFiles[0]);
      const semicolonCount = (fileContent.match(/;/g) || []).length;
      const newlineCount = (fileContent.match(/\n/g) || []).length;
      return semicolonCount > newlineCount ? ";" : "\n";
    }
    return "no_detect";
  };
  const handleOldFileUpload = (event) => {
    setOldFiles(Array.from(event.target.files));
  };
  const removeTags = async (content, tagsArray, delimiter) => {
    tagsArray.forEach((tag) => {
      content = content.split(tag).join("");
    });

    // Split content by lines to handle empty line removal
    const cleanedContentArray = content
      .split("\n") // Split by lines first
      .map(
        (line) =>
          line
            .split(delimiter) // Split by delimiter within each line
            .map((item) => item.trim())
            .filter((item) => item) // Remove empty items
            .join(delimiter) // Rejoin with delimiter
      )
      .filter((line) => line.trim() !== ""); // Remove empty lines

    // Rejoin lines with newline character to preserve line breaks
    const cleanedContent = cleanedContentArray.join("\n");

    return cleanedContent.trim();
  };

  const handleConfirmSeparator = () => {
    setDelimiter(detectedSeparator); // Set the delimiter to the detected one
    setIsModalOpen(false); // Close the modal
    processFiles(); // to remove the tags
  };

  const handleCancelSeparator = () => {
    setIsModalOpen(false); // Close the modal
  };
  const processFiles = async () => {
    let separator = delimiter;

    if (!tagsToRemove) {
      toast.error("Please specify tags to remove.");
      return;
    } else if (!oldFiles.length) {
      toast.error("Please upload files.");
      return;
    }
    if (delimiter === "AUTO") {
      separator = await detectSeparator();
      if (separator != "no_detect") {
        setDetectedSeparator(separator);
        setIsModalOpen(true);
      } // Open the modal for confirmation
      return;
    }
    const tags = tagsToRemove
      .split("\n")
      .map((tag) => tag.trim())
      .filter((tag) => tag); // Split by new line and trim

    const fileProcesses = oldFiles.map((file) =>
      readFileContent(file).then((content) => ({
        name: file.name,
        content: removeTags(content, tags, delimiter), // Remove tags from each file's content
      }))
    );

    Promise.all(fileProcesses)
      .then((results) => {
        setProcessedContents(results); // Store processed contents in state
        toast.success("Tags removed successfully!");
      })
      .catch((error) => console.error("Error processing files:", error));
  };

  const downloadProcessedContent = async () => {
    const zip = new JSZip();
    processedContents.forEach(({ name, content }) => {
      zip.file(name, content);
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "processed_files.zip";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center p-10 space-y-8 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 min-h-screen">
      <ToastContainer />
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
            onChange={handleOldFileUpload}
            style={{ display: "none" }}
          />
          <button
            className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-200"
            onClick={() => oldFileInputRef.current.click()}
          >
            Upload Files
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center mt-4">
        <label className="text-lg font-semibold text-gray-800 mb-2">
          Choose Your Delimiter:
        </label>
        <select
          value={delimiter}
          onChange={(e) => setDelimiter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-center text-gray-700 shadow-md focus:outline-none focus:border-blue-500"
        >
          <option value="AUTO">Auto</option>
          <option value="\n">New Line (\n)</option>
          <option value=";">Semicolon (;)</option>
        </select>
      </div>

      <div className="flex flex-col items-center mt-4 w-full max-w-lg">
        <label className="text-lg font-semibold text-gray-800 mb-2">
          Tags to Remove (one per line):
        </label>
        <textarea
          value={tagsToRemove}
          onChange={(e) => setTagsToRemove(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-3 text-gray-700 shadow-md focus:outline-none focus:border-blue-500 w-full h-32 resize-none"
          placeholder="Enter tags to remove, one per line"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-10 w-full max-w-lg md:justify-center mt-6">
        {/* Suggested code may be subject to a license. Learn more: ~LicenseLog:2755053658. */}
{/* Suggested code may be subject to a license. Learn more: ~LicenseLog:4077227204. */}
        <FileList files={oldFiles} titre={"Uploaded Files"} setProcessedContents={setProcessedContents} />
      </div>

      <div className="flex gap-6 mt-6">
        <button
          onClick={processFiles}
          className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium ${
            !processedContents.length ? "hidden" : ""
          }`}
        >
          <Trash2 className="w-5 h-5" />
          Remove Tags
        </button>
        <button
          className={`bg-purple-500 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-purple-600 transition-all duration-200 ${
            !processedContents.length ? "hidden" : ""
          }`}
          onClick={downloadProcessedContent}
          disabled={!processedContents.length} // Disable if no processed contents
        >
          <Download className="w-5 h-5" />
          Download Files
        </button>
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        separator={detectedSeparator}
        onConfirm={handleConfirmSeparator}
        onCancel={handleCancelSeparator}
      />
    </div>
  );
}
