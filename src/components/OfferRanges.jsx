import React, { useState } from "react";
import * as XLSX from "xlsx";

function OfferRanges() {
  const [input, setInput] = useState("");
  const [excludeInput, setExcludeInput] = useState("");
  const [results, setResults] = useState([]);
  const [copied, setCopied] = useState(false);

  const processData = () => {
    const lines = input
      .split("\n")
      .map((line) => line.trimEnd())
      .filter(Boolean);
    const excludeLines = excludeInput
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    // Build a Set of tags to exclude
    const excludeTags = new Set(
      excludeLines
        .map((line) => line.match(/\[([A-Fa-f0-9]+)\]/))
        .filter(Boolean)
        .map((m) => `[${m[1]}]`)
    );

    const result = [];
    let currentRange = null;
    let currentTags = [];

    for (const line of lines) {
      const cells = line.split("\t").filter(Boolean);

      if (/^\d+$/.test(cells[0]) && !line.startsWith("\t")) {
        if (currentRange !== null) {
          result.push({ range: currentRange, tags: [...new Set(currentTags)] }); // Remove duplicates
        }

        currentRange = parseInt(cells[0], 10);
        currentTags = [];
      }

      const tags = [...line.matchAll(/\[([A-Fa-f0-9]+)\]/g)]
        .map((m) => `[${m[1]}]`)
        .filter((tag) => !excludeTags.has(tag));

      currentTags.push(...tags);
    }

    if (currentRange !== null) {
      result.push({ range: currentRange, tags: [...new Set(currentTags)] }); // Remove duplicates
    }

    setResults(result);
    return result;
  };

  const handleProcess = () => {
    processData();
  };

  const downloadExcel = () => {
    const data = processData();
    
    // Find the maximum number of tags for any range
    const maxTags = Math.max(...data.map(item => item.tags.length));
    
    // Create worksheet data - no need to transpose for this format
    const wsData = [];
    
    // 1. Add header row with range numbers
    wsData.push(data.map(item => item.range));
    
    // 2. Add tag rows vertically under each range
    for (let i = 0; i < maxTags; i++) {
      wsData.push(data.map(item => item.tags[i] || ""));
    }
    
    // Create worksheet directly (no transposition needed)
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    const colWidths = data.map(() => ({wch: 25}));
    ws['!cols'] = colWidths;
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Offer Ranges");
    
    // Generate Excel file
    XLSX.writeFile(wb, "offer_ranges_tags.xlsx");
  };



  const copyToClipboard = () => {
    const data = processData();
    const maxTags = Math.max(...data.map(item => item.tags.length));
    
    // Create text with ranges as columns and tags below
    let text = "";
    
    // Add range headers
    text += data.map(item => item.range).join("\t") + "\n";
    
    // Add tags row by row
    for (let i = 0; i < maxTags; i++) {
      text += data.map(item => item.tags[i] || "").join("\t") + "\n";
    }
    
    navigator.clipboard.writeText(text.trim()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h3
        style={{
          color: "#333",
          borderBottom: "1px solid #eee",
          paddingBottom: "10px",
        }}
      >
        📦 Offer Ranges Tag Extractor
      </h3>

      <div style={{ marginBottom: "15px" }}>
        <label
          style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}
        >
          Paste full raw range data:
        </label>
        <textarea
          placeholder="Paste your offer ranges data here..."
          rows={12}
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontFamily: "monospace",
            fontSize: "14px",
          }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label
          style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}
        >
          Tags to exclude (one per line or [XXXX] format):
        </label>
        <textarea
          placeholder="Paste tags to exclude (e.g., 755\t[XXXX])..."
          rows={6}
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontFamily: "monospace",
            fontSize: "14px",
            backgroundColor: "#fff8f8",
          }}
          value={excludeInput}
          onChange={(e) => setExcludeInput(e.target.value)}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={handleProcess}
          style={{
            padding: "8px 15px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Process Data
        </button>

        <button
          onClick={downloadExcel}
          style={{
            padding: "8px 15px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Download Excel
        </button>

        <button
          onClick={copyToClipboard}
          style={{
            padding: "8px 15px",
            backgroundColor: "#9C27B0",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          {copied ? "Copied!" : "Copy to Clipboard"}
        </button>
      </div>

      {results.length > 0 && (
        <div
          style={{
            marginTop: "20px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            padding: "15px",
            backgroundColor: "white",
          }}
        >
          <h4 style={{ marginTop: "0", color: "#333" }}>Results Preview:</h4>
          <div
            style={{
              maxHeight: "300px",
              overflow: "auto",
              backgroundColor: "#f5f5f5",
              padding: "10px",
              borderRadius: "4px",
              fontSize: "13px",
              fontFamily: "monospace",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {results.map((item, i) => (
                    <th
                      key={i}
                      style={{
                        textAlign: "left",
                        padding: "5px",
                        border: "1px solid #ddd",
                        verticalAlign: "top",
                      }}
                    >
                      {item.range}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({
                  length: Math.max(...results.map((r) => r.tags.length)),
                }).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {results.map((item, colIndex) => (
                      <td
                        key={colIndex}
                        style={{
                          padding: "5px",
                          border: "1px solid #ddd",
                          verticalAlign: "top",
                        }}
                      >
                        {item.tags[rowIndex] || ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default OfferRanges;