import React, { useState, useEffect } from "react";
import { fetchEntityId } from "../../api/apiService";
import { toast } from "react-toastify";

export default function ModalBeta({
  isModalOpen,
  setIsModalOpen,
  onSave,
  selectedEntity,
  modalSettings,
}) {
  const [pausedSessions, setPausedSessions] = useState([]); // Store fetched sessions
  const [selectedSession, setSelectedSession] = useState(""); // Selected session
  const [startingTimeDrops, setStartingTimeDrops] = useState(1); // Starting drop index
  const [timedrops, setTimeDrops] = useState([]); // Time drops array
  const [newTimedrops, setNewTimedrops] = useState([]); // Time drops array

  // Handle starting drop number change
  const handleDropChange = (e) => {
    let value = Number(e.target.value); // Ensure it's a number
    console.log("VALUE", value);
    if (value <= timedrops.length && value >= 1) {
      setStartingTimeDrops(value);
      setNewTimedrops(timedrops.slice(value - 1));
      console.log("newTimeDrops", newTimedrops);

    } else {
      setStartingTimeDrops(1);
      setNewTimedrops(timedrops); // Ensure full list remains when invalid input
    }
  };

  // Fetch paused sessions when modal opens
  useEffect(() => {
    if (isModalOpen) {
      fetchPausedSessions();
    }
  }, [isModalOpen]);

  const fetchPausedSessions = async () => {
    try {
      const response = await fetchEntityId(selectedEntity);
      const paused = response.sessions.filter(
        (session) => session.isActive === false
      );
      const timedropsArray = response.timedrops.split(",");
      setTimeDrops(timedropsArray);
      setPausedSessions(paused);
    } catch (error) {}
  };

  return (
    <div
      className={`fixed inset-0 ${
        isModalOpen ? "flex" : "hidden"
      } justify-center items-center bg-gray-900 bg-opacity-50 z-50`}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4 shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          Drop Settings
        </h2>

        {/* Paused Sessions Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Choose Paused Session
          </label>
          <select
            value={selectedSession?.id || ""}
            onChange={(e) => {
              const selectedId = e.target.value;
              const selectedObj = pausedSessions.find(
                (session) => session.id.toString() === selectedId
              );
              setSelectedSession(selectedObj || "");
            }}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="">Select a session</option>
            {pausedSessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.name}
              </option>
            ))}
          </select>
        </div>

        {/* Starting Drop Number Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Starting Drop Number
          </label>
          <input
            type="number"
            value={startingTimeDrops}
            min={1}
            max={timedrops.length}
            onChange={handleDropChange}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Drop Time Range Display */}
        <div className="mb-4">
          <p className="block text-sm font-medium text-gray-700 mb-1 text-center bg-blue-100">
            {timedrops.length > 0
              ? `${timedrops.length - startingTimeDrops + 1} From ${
                  timedrops[startingTimeDrops - 1] || "N/A"
                } To ${timedrops[timedrops.length - 1] || "N/A"}`
              : "No drop times available"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 text-gray-700 font-medium"
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            onClick={() => {
              if (!selectedSession) {
                toast.error("Select one session at least");
                return; // Do nothing if no session selected
              }
              console.log(newTimedrops)
              onSave(selectedSession, newTimedrops, startingTimeDrops);
              
              setIsModalOpen(false);
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
