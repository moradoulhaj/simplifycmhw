import { ChevronLeft, ChevronRight, Copy } from "lucide-react";
import React from "react";
import { toast } from "react-toastify";

export default function FileViewer({
  processedContents,
  currentPage,
  handlePreviousFile,
  handleNextFile,
}) {
  const totalFiles = processedContents.length;
  // Function to handle copying content
  const handleCopyContent = () => {
    const content = processedContents[currentPage].content;
    navigator.clipboard.writeText(content).then(() => {
      toast.success("Content copied to clipboard!");  
    });
    handleNextFile();  

  };

  return (
    <div className="w-full max-w-4xl mt-8 p-6 border border-gray-300 rounded-lg shadow-lg bg-white">
      {totalFiles > 0 && (
        <div>
          <div className="">
          <button
                onClick={handleCopyContent}
                className="flex items-center gap-2P p-4 w-full bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-all duration-200 font-medium"
              >
                <Copy className="w-5 h-5" />
                Copy Content
              </button>
          </div>

          <div className=" text-center m-2">
            <span className="text-gray-600 font-medium text-xl">
              File {currentPage + 1} of {totalFiles}
            </span>
          </div>
          <hr className="text-2xl mb-2" />
          <div className="flex w-full justify-between mt-2">
            {/* // Previous button */}
            <div className="justify-items-start">
              <button
                onClick={handlePreviousFile}
                disabled={currentPage === 0}
                className={`px-4 py-2 rounded-lg  h-full shadow-md text-white font-medium transition-colors duration-300 ${
                  currentPage === 0
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                <ChevronLeft />
              </button>
            </div>
            {/* // Title and Content  */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md shadow-sm justify-center w-1/2 text-center">
              <h4 className="text-lg font-bold text-gray-800 mb-2">
                {processedContents[currentPage].name}
              </h4>
              <pre className="text-sm whitespace-pre-wrap break-words text-gray-700 leading-relaxed text-center">
                {processedContents[currentPage].content}
              </pre>
            </div>
            {/* // Next button */}
            <div className="justify-end">
              {/* <span className="text-gray-600 font-medium">
                File {currentPage + 1} of {totalFiles}
              </span> */}
              <button
                onClick={handleNextFile}
                disabled={currentPage === totalFiles - 1}
                className={`px-4 py-2 h-full rounded-lg shadow-md text-white font-medium transition-colors duration-300 ${
                  currentPage === totalFiles - 1
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
