import React, { useState } from "react";
import TextAreaWithCopyDesktop from "./Small Components/TextAreaWithCopyDesktop";
import { ToastContainer } from "react-toastify";
import { FileIcon } from "lucide-react";
import { removeDup } from "../../api/apiService";
import VirtualizedTextListWithCopy from "./Small Components/VirtualizedTextListWithCopy.jsx";

export default function EmailDuplicateChecker() {
  const [inputMode, setInputMode] = useState("paste");
  const [count, setCount] = useState(0);

  const [emailsInput, setEmailsInput] = useState("");
  const [fileEmails, setFileEmails] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("Nothing");

  const [loading, setLoading] = useState(false);

  const [results, setResults] = useState({
    duplicates: "",
    uniques: "",
    withoutDuplicates: "",
  });

  const normalizeAlias = (email, position) => {
    try {
      const [alias, domain] = email.trim().split("@");
      if (domain !== "gmail.com") {
        setError(
          `🚫 Invalid Email Detected! | EMAIL: ${email} | POSITION: ${position} | REASON: Not a Gmail account`
        );
        return null;
      }
      return alias.toLowerCase() + "@" + domain.toLowerCase();
    } catch {
      return null;
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setFileEmails(event.target.result);
      setEmailsInput(event.target.result);
    };
    reader.readAsText(file);
    setFileName(file.name);
    e.target.value = null;
  };

  const processEmails = async () => {
    setError("Nothing");
    setLoading(true);

    const input = inputMode === "paste" ? emailsInput : fileEmails;

    const emailList = input
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    try {
      const data = await removeDup(emailList);

      setResults({
        duplicates: data.duplicates.join("\n"),
        uniques: data.uniques.join("\n"),
        withoutDuplicates: data.withoutDuplicates.join("\n"),
      });
    } catch (err) {
      setError("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderResultTextAreas = () => {
    const categories = [
      { id: "duplicates", label: "Duplicates", data: results.duplicates },
      { id: "uniques", label: "Unique Emails", data: results.uniques },
      {
        id: "withoutDuplicates",
        label: "Cleaned (no dupes)",
        data: results.withoutDuplicates,
      },
    ];

    return categories.map(({ id, label, data }) =>
      data?.length ? (
        <VirtualizedTextListWithCopy key={id} id={id} label={label} data={data} />
      ) : null
    );
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto bg-white shadow-xl rounded-2xl border border-gray-100">
      <h2 className="text-4xl font-extrabold mb-8 text-center text-gray-800 tracking-tight">
        ✉️ Email Deduplicator v2
      </h2>

      {/* Progress Bar */}
      {loading && (
  <div className="flex justify-center mb-6">
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
)}


      {/* Toggle Buttons */}
      <div className="flex justify-center mb-6 space-x-4">
        {["paste", "file"].map((mode) => (
          <button
            key={mode}
            className={`px-5 py-2 rounded-full font-semibold transition duration-200 shadow-sm ${
              inputMode === mode
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setInputMode(mode)}
            disabled={loading}
          >
            {mode === "paste" ? "📋 Paste Emails" : "📁 Upload File"}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error !== "Nothing" && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-center mb-6">
          <strong className="font-bold">Error: </strong>
          <span>{error}</span>
        </div>
      )}

      {/* Input Area */}
      <div className="mb-8">
        {inputMode === "paste" ? (
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Paste Emails:
            </label>
            <textarea
              rows="10"
              className="w-full p-3 border border-gray-300 rounded-md shadow-inner resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={emailsInput}
              onChange={(e) => {
                setEmailsInput(e.target.value);
                setCount(e.target.value.split("\n").length);
              }}
              placeholder="Paste one email per line..."
              disabled={loading}
            />
            <p className="mt-2 text-sm text-gray-500">
              Total lines: <strong>{count}</strong>
            </p>
          </div>
        ) : (
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Upload .txt or .csv File:
            </label>
            <input
              key={Date.now()}
              type="file"
              accept=".txt,.csv"
              disabled={loading}
              className="block w-full border border-gray-300 rounded-md p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              onChange={handleFileUpload}
            />
            {fileName && (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                <FileIcon size={18} />
                <p className="truncate">Uploaded File: {fileName}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="text-center mb-10">
        <button
          onClick={processEmails}
          disabled={loading}
          className={`px-6 py-3 rounded-lg transition transform shadow-md ${
            loading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105"
          }`}
        >
          {loading ? "⏳ Processing..." : "🚀 Process Emails"}
        </button>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderResultTextAreas()}
      </div>

      <ToastContainer />
    </div>
  );
}
