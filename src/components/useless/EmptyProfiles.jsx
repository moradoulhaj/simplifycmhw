import React, { useState, useMemo } from "react";

function EmptyProfiles() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  // Memoize parsing logic so it only runs when 'text' changes
  const parsedResult = useMemo(() => {
    const regex = /profiles\s*\(([^)]+)\).*?list\s*([A-Za-z0-9_]+)\s*\(#\d+\)/g;
    let match;
    let result = "";

    while ((match = regex.exec(text)) !== null) {
      const profiles = match[1].split(",").map((p) => p.trim());
      const listName = match[2];

      result += `${listName}\n${profiles.join("\n")}\n\n`;
    }
    return result.trim();
  }, [text]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => setText(event.target.result);
    reader.readAsText(file);
  };

  const downloadTxt = () => {
    if (!parsedResult) return;
    const blob = new Blob([parsedResult], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "extracted_profiles.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(parsedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-12 text-slate-800">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Profile Extractor</h1>
          <p className="text-slate-500">Extract profile lists from raw logs into clean text.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-sm uppercase tracking-wider text-slate-600">Raw Input</label>
              <input 
                type="file" 
                accept=".txt" 
                onChange={handleFileUpload}
                className="text-xs text-slate-500 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <textarea
              className="w-full h-[500px] p-4 border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-sm"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste logs here or upload a file..."
            />
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center h-8">
              <label className="font-semibold text-sm uppercase tracking-wider text-slate-600">Processed Output</label>
              {parsedResult && (
                <div className="flex gap-2">
                  <button 
                    onClick={copyToClipboard}
                    className="text-xs font-medium px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
                  >
                    {copied ? "✅ Copied!" : "Copy"}
                  </button>
                  <button 
                    onClick={downloadTxt}
                    className="text-xs font-medium px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Download .txt
                  </button>
                </div>
              )}
            </div>

            <div className="w-full h-[500px] bg-slate-900 rounded-xl shadow-inner overflow-auto p-4 border border-slate-800">
              {parsedResult ? (
                <pre className="text-emerald-400 font-mono text-sm whitespace-pre-wrap">
                  {parsedResult}
                </pre>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 italic text-sm">
                  Waiting for valid input...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmptyProfiles;