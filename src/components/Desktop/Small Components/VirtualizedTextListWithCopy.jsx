import React from "react";
import { FixedSizeList as List } from "react-window";
import { Copy } from "lucide-react";
import { toast } from "react-toastify";

export default function VirtualizedTextListWithCopy({ id, label, data }) {
  const lines = data.split("\n");

  const copyToClipboard = () => {
    navigator.clipboard.writeText(data);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow border">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-700">{label}</h3>
        <button
          onClick={copyToClipboard}
          className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
        >
          <Copy size={16} className="mr-1" /> Copy
        </button>
      </div>
      <div className="border rounded bg-white h-60 overflow-hidden">
        <List
          height={240}
          itemCount={lines.length}
          itemSize={30}
          itemData={lines}
          width={"100%"}
        >
          {({ index, style, data }) => (
            <div
              style={style}
              className="px-2 py-1 border-b text-sm text-gray-800 truncate"
            >
              {data[index]}
            </div>
          )}
        </List>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Total: <strong>{lines.length}</strong>
      </p>
    </div>
  );
}
