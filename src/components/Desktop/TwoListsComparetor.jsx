import React, { useState } from "react";
import TextAreaWithCopyDesktop from "./Small Components/TextAreaWithCopyDesktop";
import { toast, ToastContainer } from "react-toastify";

export default function TwoListsComparetor() {
  const [inputMode, setInputMode] = useState("text");
  const [list1Input, setList1Input] = useState("");
  const [list2Input, setList2Input] = useState("");
  const [filteredEmails, setFilteredEmails] = useState("");
  const [error, setError] = useState("Nothing");
  const [fileName1, setFileName1] = useState(""); // Store the name of the file uploaded for List 1
  const [fileName2, setFileName2] = useState(""); // Store the name of the file uploaded for List 2

  const normalizeAlias = (email, position, list) => {
    try {
      const [alias, domain] = email.trim().split("@");
      if (domain !== "gmail.com") {
        setError(
          `🚫 Invalid Email Detected! | EMAIL: ${email} | POSITION: ${position} | LIST: ${list} | REASON: Not a Gmail account`
        );
        setFilteredEmails("");
        return;
      }
      return alias.toLowerCase();
    } catch {
      return null;
    }
  };

  const handleFileRead = (file, setter, setFileName) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setter(event.target.result); // Set the file content as text
      setFileName(file.name); // Update the file name
    };
    reader.readAsText(file);
  };

  const processEmails = () => {
    setError("Nothing"); // Reset error
    setFilteredEmails(""); // Reset filtered emails

    const rawList1 = list1Input.split("\n").map((e) => e.trim()).filter(Boolean);
    const rawList2 = list2Input.split("\n").map((e) => e.trim()).filter(Boolean);

    // 🔍 Check for non-Gmail emails in List 1
    for (let i = 0; i < rawList1.length; i++) {
      const norm = normalizeAlias(rawList1[i], i + 1, 1); // reuse same function
      if (!norm) return; // If non-Gmail, stop processing
    }

    // ✅ All List 1 emails are Gmail, build the alias set
    const list1Aliases = new Set(rawList1.map((email) => normalizeAlias(email)).filter(Boolean));

    const filtered = [];

    // 🔍 Now validate and filter List 2
    for (let i = 0; i < rawList2.length; i++) {
      const norm = normalizeAlias(rawList2[i], i + 1, 2);
      if (!norm) return; // Abort if non-Gmail
      if (!list1Aliases.has(norm)) filtered.push(rawList2[i]);
    }

    if (filtered.length === 0) {
      setError("No remaining emails after filtering.");
    }

    setFilteredEmails(filtered.join("\n"));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        Compare Two Lists
      </h2>

      {/* Toggle Buttons */}
      <div className="flex justify-center mb-6 space-x-4">
        <button
          className={`px-4 py-2 rounded-md font-medium ${
            inputMode === "text" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => setInputMode("text")}
        >
          Paste Emails
        </button>
        <button
          className={`px-4 py-2 rounded-md font-medium ${
            inputMode === "file" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => setInputMode("file")}
        >
          Upload File
        </button>
      </div>

      {/* Error div */}
      {error !== "Nothing" && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center mb-4">
          <strong className="font-bold">Error: </strong>
          <span className=" ">{error}</span>
        </div>
      )}

      {/* Inputs */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* List 1 */}
        <div className="flex-1">
          <label className="block mb-2 font-medium text-gray-700">
            List 1 (to exclude):
          </label>
          {inputMode === "text" ? (
            <textarea
              rows="12"
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm resize-none focus:outline-none focus:ring focus:border-blue-300"
              value={list1Input}
              onChange={(e) => setList1Input(e.target.value)}
              placeholder="Emails to remove, one per line"
            />
          ) : (
            <div className="flex items-center">
              <input
                key={Math.random()} // This forces the input to reset each time
                type="file"
                accept=".txt,.csv"
                onChange={(e) => handleFileRead(e.target.files[0], setList1Input, setFileName1)}
                className="block w-full border p-2 rounded-md shadow-sm"
              />
              {fileName1 && (
                <span className="ml-4 text-sm text-gray-600">{fileName1}</span>
              )}
            </div>
          )}
        </div>

        {/* List 2 */}
        <div className="flex-1">
          <label className="block mb-2 font-medium text-gray-700">
            List 2 (to filter):
          </label>
          {inputMode === "text" ? (
            <textarea
              rows="12"
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm resize-none focus:outline-none focus:ring focus:border-blue-300"
              value={list2Input}
              onChange={(e) => setList2Input(e.target.value)}
              placeholder="Emails to keep if not in List 1"
            />
          ) : (
            <div className="flex items-center">
              <input
                key={Math.random()} // This forces the input to reset each time
                type="file"
                accept=".txt,.csv"
                onChange={(e) => handleFileRead(e.target.files[0], setList2Input, setFileName2)}
                className="block w-full border p-2 rounded-md shadow-sm"
              />
              {fileName2 && (
                <span className="ml-4 text-sm text-gray-600">{fileName2}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Process Button */}
      <div className="text-center mb-6">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow"
          onClick={processEmails}
        >
          Remove Matching Emails
        </button>
      </div>

      {/* Result */}
      {filteredEmails && (
        <TextAreaWithCopyDesktop
          id="filtered"
          label="Filtered List (Remaining from List 2)"
          value={filteredEmails}
        />
      )}

      <ToastContainer />
    </div>
  );
}
