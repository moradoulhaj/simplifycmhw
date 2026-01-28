import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ChartNoAxesCombined, RotateCcw } from "lucide-react";
import TagsInput from "./smalls/TagsInput";
import {
  calcSessions,
  collectData,
  
  generateExcel,
  parseNumberTagPairs,
  splitSessionsByDrops,
} from "../scripts/spliterScripts";
import EntitySelector from "./smalls/EntitySelector";

export default function Spliter() {
  const [tagsToSplit, setTagsToSplit] = useState("");
  const [dropNumbers, setDropNumbers] = useState();
  const [entityName, setEntityName] = useState();

  const handleDropNumberChange = (e) => {
    setDropNumbers(e.target.value);
  };

  const handleReset = () => {
    setTagsToSplit("");
    setSessionCount("");
    setSeedsBySessions([]);
    setSeedsBySessionPerDrop([]);
    setDropNumbers(1);
  };

  const handleSplit = async () => {
    // if no tag area is empty
    if (tagsToSplit === "") {
      toast.error("No tags");
      return;
    }
    //Taking the first line of the input
    const firstLine = tagsToSplit.split("\n")[0];
    // then passung the first line to return the number of sessions
    const sessionsNumber = calcSessions(firstLine);

    if (sessionsNumber === 0) {
      toast.error("No sessions");
      return;
    }

    const lines = tagsToSplit
      .split("\n")
      .map((line) => parseNumberTagPairs(line));

    const collectedData = await collectData(lines, sessionsNumber);
    if (collectedData === "wrongIinput") {
      return;
    }
    const splitDataByDrops = splitSessionsByDrops(collectedData, dropNumbers);
    toast.success("Split successfully");
    generateExcel(splitDataByDrops,entityName);
  };

  return (
    <div className="flex flex-col items-center p-10 space-y-8 bg-gray-100 min-h-screen">
      <ToastContainer theme="colored" />

      {/* Header */}
      <div className="w-full max-w-4xl flex justify-between items-center bg-blue-500 p-4 rounded-lg shadow-lg">
        <h2 className="text-4xl font-bold text-white drop-shadow-md">
          Spliter
        </h2>
        <div className="flex gap-4">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg shadow-md transition-transform transform hover:scale-105 active:scale-95"
          >
            <RotateCcw className="w-5 h-5" /> Reset
          </button>
        </div>
      </div>

      {/* Input Fields */}
      <div className="flex flex-wrap justify-center gap-6 w-full max-w-3xl">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Entity Selection Dropdown */}
          <div className="flex flex-col items-center">
            <EntitySelector
              entityName={entityName}
              setEntityName={setEntityName}
            />
          </div>
          <div className="w-full max-w-xs">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <ChartNoAxesCombined className="w-4 h-4" />

              <span>Drops Number</span>
            </label>
            <input
              value={dropNumbers}
              onChange={handleDropNumberChange}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg appearance-none cursor-pointer hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
              min={0}
              placeholder="Drops Number"
            >
              {/* Suggested code may be subject to a license. Learn more: ~LicenseLog:4148738801. */}
            </input>
          </div>
        </div>
      </div>

      {/* Tags Input */}
      <TagsInput
        tagsToRemove={tagsToSplit}
        setTagsToRemove={setTagsToSplit}
        content="Tags to split"
      />

      {/* Buttons */}
      <div className="flex gap-6 mt-6">
        <button
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSplit}
        >
          Split & Download Excel
        </button>
      </div>
    </div>
  );
}
