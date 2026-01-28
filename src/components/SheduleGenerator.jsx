import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, RotateCcw, Check, AlertTriangle } from "lucide-react";
import { fetchEntities, fetchEntityId } from "../api/apiService";
import SessionModal from "./SpliterComponents/SessionModal";
import { generateSchedule } from "../scripts/spliterScripts";
import JSZip from "jszip";

export default function SheduleGenerator() {
  const [timeDrops, setTimeDrops] = useState([]);
  const [editedTimeDrops, setEditedTimeDrops] = useState("");
  const [activeSessions, setActiveSessions] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [entities, setEntities] = useState([]);
  const [sessionData, setSessionData] = useState([]);
  const [seedsArray, setSeedsArray] = useState([]);
  const [removeTimeoutTasks, setRemoveTimeoutTasks] = useState(1);
  const [isSessionModalOpen, setSessionModalOpen] = useState(false);

  useEffect(() => {
    const loadEntities = async () => {
      try {
        const data = await fetchEntities();
        setEntities(data);
        if (data.length > 0) setSelectedEntity(data[0].id);
      } catch (error) {
        toast.error("Failed to fetch entities.");
      }
    };
    loadEntities();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchEntityId(selectedEntity);
        setLoading(false);
        const timedropsArray = data.timedrops ? data.timedrops.split(",") : [];
        setTimeDrops(timedropsArray);
        setEditedTimeDrops(timedropsArray.join("\n"));

        const sortedSessions = (data.sessions || []).sort(
          (a, b) => a.index - b.index
        );
        setActiveSessions(sortedSessions.filter((s) => s.isActive));
        setSessionData(sortedSessions);
      } catch (error) {
        toast.error("Failed to fetch data from API!");
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedEntity, isSessionModalOpen]);

  const handleGenerateClick = async () => {
    if (!seedsArray.length || !activeSessions.length) {
      toast.error("Please load seeds and sessions first.");
      return;
    }
    if (seedsArray[0].length != timeDrops.length) {
      toast.error("TimeDrops number mismatch");
      return;
    }
    if (seedsArray.length != activeSessions.length) {
      toast.error("Active Session mismatch number mismatch");
      return;
    }

    let filteredSeedsArray = seedsArray;
    let filteredTimeDrops = timeDrops;

    const dropSkipCount = parseInt(removeTimeoutTasks);
    if (!isNaN(dropSkipCount) && dropSkipCount > 0) {
      filteredSeedsArray = seedsArray.map((sessionDrops) =>
        sessionDrops.slice(dropSkipCount)
      );
      filteredTimeDrops = timeDrops.slice(dropSkipCount);
    }

    const zip = new JSZip();

    for (
      let sessionIndex = 0;
      sessionIndex < filteredSeedsArray.length;
      sessionIndex++
    ) {
      const sessionDrops = filteredSeedsArray[sessionIndex];
      const session = activeSessions[sessionIndex];

      try {
        let excelBlob = await generateSchedule(
          sessionDrops,
          filteredTimeDrops,
          session.username,
          session.config,
          session.script,
          true,
          false,
          [],
          3,
          true,
          false
        );

        zip.file(`Excels/${session.name}.xlsx`, excelBlob);
      } catch (error) {
        console.error(
          `Error generating Excel for session ${session.name}:`,
          error
        );
      }
    }

    zip.generateAsync({ type: "blob" }).then((zipBlob) => {
      saveAs(zipBlob, "Schedules.zip");
      toast.success("ZIP file generated and downloaded!");
    });
  };

  const handleSessionClick = () => {
    if (sessionData.length === 0) {
      toast.error("No session data available!");
      return;
    }
    setSessionModalOpen(true);
  };

  const handleReset = () => {
    setTimeDrops([]);
    setSeedsArray([]);
    setEditedTimeDrops("");
  };

  const handleSaveTimeDrops = () => {
    const updatedDrops = editedTimeDrops
      .split("\n")
      .map((drop) => drop.trim())
      .filter((drop) => drop !== "");
    setTimeDrops(updatedDrops);
    toast.success("Time drops updated!");
  };

  // Validation indicators
  const hasTimeDrops = timeDrops.length > 0;
  const hasSessions = activeSessions.length > 0;
  const hasSeeds = seedsArray.length > 0;
  const dropsMatch = hasSeeds && hasTimeDrops && seedsArray[0]?.length === timeDrops.length;
  const sessionsMatch = hasSeeds && hasSessions && seedsArray.length === activeSessions.length;

  return (
    <div className="flex flex-col items-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <ToastContainer 
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      {/* Compact Header */}
      <div className="w-full max-w-6xl flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-800 p-4 rounded-xl shadow-lg mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Schedule Generator</h2>
          <p className="text-blue-100 text-sm">Generate schedules for multiple sessions</p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm shadow-md"
        >
          <RotateCcw size={16} /> Reset
        </button>
      </div>

      {/* Compact Main Content */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Left Panel - More Compact */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-800">Time Drops</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              hasTimeDrops ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {hasTimeDrops ? `${timeDrops.length} drops` : 'No drops'}
            </span>
          </div>

          <textarea
            value={editedTimeDrops}
            onChange={(e) => setEditedTimeDrops(e.target.value)}
            rows={6}
            className="w-full p-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter drop numbers, one per line..."
          />
          
          <button
            onClick={handleSaveTimeDrops}
            className="w-full flex items-center justify-center gap-1 px-3 py-2 mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-md"
          >
            <Check size={16} /> Save Drops (Locally)
          </button>
        </div>

        {/* Right Panel - More Compact */}
        <div className="space-y-4">
          {/* Entity Selector - Compact */}
          <div className="bg-white p-4 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Entity</h3>
            <select
              value={selectedEntity}
              onChange={(e) => {
                setSelectedEntity(e.target.value);
                setSessionData([]);
                setTimeDrops([]);
                setEditedTimeDrops("");
                setActiveSessions([]);
              }}
              className="w-full p-2 text-sm border border-gray-300 rounded-lg shadow-sm"
            >
              {entities.map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {entity.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sessions Info - Compact */}
          <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Sessions</h3>
              <button
                onClick={handleSessionClick}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
              >
                <Eye size={16} /> View
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {activeSessions.length} active sessions
            </div>
          </div>

          {/* File Upload - Compact */}
          <div className="bg-white p-4 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Seeds Data</h3>
            <label className="block">
              <span className="sr-only">Upload seeds file</span>
              <input 
                type="file" 
                className="block w-full text-sm text-gray-500
                  file:mr-2 file:py-1.5 file:px-3
                  file:rounded-lg file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                accept=".txt"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  const reader = new FileReader();
                  reader.onload = (event) => {
                    try {
                      const json = JSON.parse(event.target.result);
                      setSeedsArray(json);
                      toast.success("Seeds loaded!");
                    } catch (err) {
                      toast.error("Invalid file format");
                    }
                  };
                  reader.readAsText(file);
                }}
              />
            </label>

            {hasSeeds && (
              <div className="mt-3 space-y-1.5">
                <div className={`flex items-start p-2 rounded-lg text-xs ${
                  dropsMatch ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  {dropsMatch ? (
                    <Check className="mr-1.5 mt-0.5 flex-shrink-0" size={14} />
                  ) : (
                    <AlertTriangle className="mr-1.5 mt-0.5 flex-shrink-0" size={14} />
                  )}
                  <span>
                    {dropsMatch ? 'Drops match' : 'Drops mismatch'}: {seedsArray[0]?.length} vs {timeDrops.length}
                  </span>
                </div>
                <div className={`flex items-start p-2 rounded-lg text-xs ${
                  sessionsMatch ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  {sessionsMatch ? (
                    <Check className="mr-1.5 mt-0.5 flex-shrink-0" size={14} />
                  ) : (
                    <AlertTriangle className="mr-1.5 mt-0.5 flex-shrink-0" size={14} />
                  )}
                  <span>
                    {sessionsMatch ? 'Sessions match' : 'Sessions mismatch'}: {seedsArray.length} vs {activeSessions.length}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Timeout Tasks - Compact */}
          <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="flex items-center gap-2">
              <label htmlFor="removeTimeoutTasks" className="text-sm font-medium text-gray-700">
                Skip first:
              </label>
              <input
                type="number"
                id="removeTimeoutTasks"
                min="0"
                value={removeTimeoutTasks}
                onChange={(e) => setRemoveTimeoutTasks(e.target.value)}
                className="w-16 p-1.5 text-sm border border-gray-300 rounded-lg shadow-sm"
              />
              <span className="text-sm text-gray-600">drops</span>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Button - Compact */}
      <div className="w-full max-w-6xl">
        <button
          className={`w-full px-4 py-3 text-sm font-semibold rounded-lg shadow-md ${
            dropsMatch && sessionsMatch 
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          onClick={handleGenerateClick}
          disabled={!dropsMatch || !sessionsMatch}
        >
          Generate Schedule ZIP
        </button>
      </div>

      <SessionModal
        isOpen={isSessionModalOpen}
        setSessionModalOpen={setSessionModalOpen}
        sessionData={sessionData}
      />
    </div>
  );
}