import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, RotateCcw, Settings } from "lucide-react";
import TagsInput from "./smalls/TagsInput";
import {
  calcSessions,
  collectData,
  downloadZip,
  generateExcel,
  parseNumberTagPairs,
  reassignUniqueFoldersToFirstTags,
  shuffleTagsInSessions,
  splitProportionedAndRemainder,
  splitSessionsByDrops,
} from "../scripts/spliterScripts";
import { fetchEntities, fetchEntityId } from "../api/apiService";
import SpliterSettingsModal from "./SpliterComponents/SpliterSettingsModal";
import SessionModal from "./SpliterComponents/SessionModal";
import TimeDropsModal from "./SpliterComponents/TimeDropsModal";
import NextDayModal from "./SpliterComponents/NextDayModal";

export default function SpliterBeta() {
  const [processedContents, setProcessedContents] = useState([]);
  const [tagsToSplit, setTagsToSplit] = useState("");
  const [sessionCount, setSessionCount] = useState("");
  const [seedsBySessions, setSeedsBySessions] = useState([]);
  const [timeDrops, setTimeDrops] = useState([]);
  const [activeSessions, setActiveSessions] = useState(0);
  const [selectedEntity, setSelectedEntity] = useState(1);
  const [selectedEntityName, setSelectedEntityName] = useState("");
  const [loading, setLoading] = useState(true);
  const [entities, setEntities] = useState([]);
  const [seedsBySessionPerDrop, setSeedsBySessionPerDrop] = useState([]);
  const [delimiter, setDelimiter] = useState("\n");
  const [sessionData, setSessionData] = useState([]);
  const [nextDaySeeds, setNextDaySeeds] = useState([]);

  // Modal states
  const [isSessionModalOpen, setSessionModalOpen] = useState(false);
  const [isNextDayModalOpen, setIsNextDayModalOpen] = useState(false);
  const [isTimeDropsModalOpen, setIsTimeDropsModalOpen] = useState(false);
  
  const [modalSettings, setModalSettings] = useState({
    isOpen: false,
    useFixedQuantity: false,
    fixedQuantity: "",
    shuffle: false,
    fastKill: true,
    loginNextDay: true,
    timeType: 3,
    scheduleTasks: true,
    coversationOff: false,
    morningDrops: 7,
    morningDropsQuantity: 50,
    nightDrops: 0,
    nightDropsQuantity: 100,
  });

  useEffect(() => {
    const loadEntities = async () => {
      try {
        const data = await fetchEntities();
        data.sort((a, b) => {
          const numA = parseInt(a.name.match(/\d+/));
          const numB = parseInt(b.name.match(/\d+/));
          return numA - numB;
        });
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
        setSelectedEntityName(data.name);
        const timedropsArray = data.timedrops ? data.timedrops.split(",") : [];
        setTimeDrops(timedropsArray);
        const sortedSessions = (data.sessions || []).sort(
          (a, b) => a.index - b.index
        );
        setActiveSessions(
          sortedSessions
            ? sortedSessions.filter((session) => session.isActive)
            : []
        );
        setSessionData(sortedSessions);
      } catch (error) {
        toast.error("Failed to fetch data from API!");
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [selectedEntity, isSessionModalOpen]);

  const handleSessionClick = () => {
    if (sessionData.length === 0) {
      toast.error("No session data available!");
      return;
    }
    setSessionModalOpen(true);
  };

  const handleTimeDropsClick = () => {
    if (timeDrops.length === 0) {
      toast.error("No TimeDrops data available!");
      return;
    }
    setIsTimeDropsModalOpen(true);
  };

  const HandleNextDaySeeds = () => {
    setIsNextDayModalOpen(true);
  };

  const handleReset = () => {
    setProcessedContents([]);
    setTagsToSplit("");
  };

  const handleSplitClick = () => {
    if (tagsToSplit != "") {
      nextDaySeeds == ""
        ? setModalSettings((prev) => ({
            ...prev,
            loginNextDay: false,
            isOpen: true,
          }))
        : setModalSettings((prev) => ({
            ...prev,
            loginNextDay: true,
            isOpen: true,
          }));
    } else {
      toast.error("No tags to split found ");
      return;
    }
  };

  const handleSplit = async () => {
    console.log("dferzer",timeDrops)
    if (tagsToSplit === "") {
      toast.error("No tags");
      return;
    }

    const firstLine = tagsToSplit.split("\n")[0];
    const sessionsNumber = calcSessions(firstLine);
    setSessionCount(sessionsNumber);

    if (sessionsNumber === 0) {
      toast.error("No sessions");
      return;
    } else if (sessionsNumber != activeSessions.length) {
      toast.error("Session count mismatch");
      return;
    }

    const lines = tagsToSplit
      .split("\n")
      .map((line) => parseNumberTagPairs(line));

    let collectedData = await collectData(lines, sessionsNumber);
    setSeedsBySessions(collectedData);
    if (modalSettings.shuffle) {
      collectedData = shuffleTagsInSessions(collectedData);
    }
    if (collectedData === "wrongIinput") {
      return;
    }

    let finalSplitData = [];

    if (selectedEntity == 7) {
      const totalMorningSeeds =
        modalSettings.morningDropsQuantity * modalSettings.morningDrops;
      const totalNightSeeds =
        modalSettings.nightDrops * modalSettings.nightDropsQuantity;

      const { proportioned, remainder } = splitProportionedAndRemainder(
        collectedData,
        totalMorningSeeds
      );
      const dropsFromProportioned = splitSessionsByDrops(
        proportioned,
        modalSettings.morningDrops,
        true,
        modalSettings.morningDropsQuantity
      );

      const dropsFromRemainder = splitSessionsByDrops(
        remainder,
        modalSettings.nightDrops,
        modalSettings.nightDropsQuantity == 0 ? false : true,
        modalSettings.nightDropsQuantity
      );

      finalSplitData = dropsFromProportioned.map(
        (morningSessionDrops, index) => {
          const nightSessionDrops = dropsFromRemainder[index];
          return [...morningSessionDrops, ...nightSessionDrops];
        }
      );
    } else {
      finalSplitData = splitSessionsByDrops(
        collectedData,
        timeDrops.length,
        modalSettings.useFixedQuantity,
        modalSettings.fixedQuantity
      );
    }

    if (selectedEntity == 70) {
      finalSplitData = finalSplitData.map((session) =>
        session.map((drop) => reassignUniqueFoldersToFirstTags(drop))
      );
    }

    downloadZip(
      finalSplitData,
      delimiter,
      selectedEntityName,
      timeDrops,
      activeSessions,
      modalSettings.fastKill,
      modalSettings.loginNextDay,
      nextDaySeeds,
      modalSettings.timeType,
      modalSettings.scheduleTasks,
      modalSettings.coversationOff
    );
    
    if (selectedEntityName == "CMH12") {
      downloadZip(
        finalSplitData,
        delimiter,
        "CMH13",
        timeDrops,
        activeSessions,
        modalSettings.fastKill,
        modalSettings.loginNextDay,
        nextDaySeeds,
        modalSettings.timeType,
        modalSettings.scheduleTasks,
        modalSettings.coversationOff
      );
    }

    setSeedsBySessionPerDrop(finalSplitData);
    toast.success("Split successfully");
    setProcessedContents(collectedData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <ToastContainer 
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 p-6 bg-white rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Spliter Tool
          </h1>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={HandleNextDaySeeds}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition-all"
            >
              <Settings className="w-5 h-5" />
              <span>Next Day Seeds</span>
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-md transition-all"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Entity Selection */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Entity Configuration
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Entity
                  </label>
                  <select
                    value={selectedEntity}
                    onChange={(e) => {
                      setSelectedEntity(e.target.value);
                      setSessionData([]);
                      setTimeDrops([]);
                      setActiveSessions(0);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    {entities.map((entity) => (
                      <option key={entity.id} value={entity.id}>
                        {entity.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    className="bg-blue-50 p-3 rounded-lg cursor-pointer hover:bg-blue-100 transition"
                    onClick={handleTimeDropsClick}
                  >
                    <div className="text-sm text-gray-600">Drop Numbers</div>
                    {loading ? (
                      <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-blue-600">
                          {timeDrops.length}
                        </div>
                        <Eye className="text-gray-500" size={18} />
                      </div>
                    )}
                  </div>

                  <div 
                    className="bg-purple-50 p-3 rounded-lg cursor-pointer hover:bg-purple-100 transition"
                    onClick={handleSessionClick}
                  >
                    <div className="text-sm text-gray-600">Active Sessions</div>
                    {loading ? (
                      <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-purple-600">
                          {activeSessions.length}
                        </div>
                        <Eye className="text-gray-500" size={18} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Delimiter Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delimiter
                  </label>
                  <select
                    value={delimiter}
                    onChange={(e) => setDelimiter(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="\n">New Line (\n)</option>
                    <option value=";">Semicolon (;)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <button
                onClick={handleSplitClick}
                disabled={!tagsToSplit}
                className={`w-full py-3 px-4 text-lg font-semibold rounded-lg shadow-md transition-all ${
                  tagsToSplit 
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Split Tags
              </button>
            </div>
          </div>

          {/* Right Column - Tags Input */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-md h-full">
              <TagsInput
                tagsToRemove={tagsToSplit}
                setTagsToRemove={setTagsToSplit}
                setProcessedContents={setProcessedContents}
                content="Tags to split"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SpliterSettingsModal
        modalSettings={modalSettings}
        setModalSettings={setModalSettings}
        onApply={handleSplit}
        selectedEntity={selectedEntity}
        timedrops={timeDrops}
        nextDaySeeds={nextDaySeeds}
      />

      <SessionModal
        isOpen={isSessionModalOpen}
        setSessionModalOpen={setSessionModalOpen}
        sessionData={sessionData}
      />

      <TimeDropsModal
        isOpen={isTimeDropsModalOpen}
        onClose={() => setIsTimeDropsModalOpen(false)}
        timeDrops={timeDrops}
        setTimeDrops={setTimeDrops}
        entityId={selectedEntity}
        entityName={selectedEntityName}
      />

      <NextDayModal
        isOpen={isNextDayModalOpen}
        onClose={() => setIsNextDayModalOpen(false)}
        nextDaySeeds={nextDaySeeds}
        setNextDaySeeds={setNextDaySeeds}
      />
    </div>
  );
}