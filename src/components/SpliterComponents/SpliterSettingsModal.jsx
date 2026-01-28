import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

export default function SpliterSettingsModal({
  modalSettings,
  setModalSettings,
  onApply,
  selectedEntity,
  timedrops,
  nextDaySeeds,
}) {
  const {
    isOpen,
    useFixedQuantity,
    fixedQuantity,
    shuffle,
    fastKill,
    loginNextDay,
    timeType,
    scheduleTasks,
    coversationOff,
    morningDrops,
    morningDropsQuantity,
    nightDrops,
    nightDropsQuantity,
  } = modalSettings;

  if (!isOpen) return null;
  
  useEffect(() => {
    setModalSettings((prev) => ({ ...prev, morningDrops: timedrops.length }));
    setModalSettings((prev) => ({ ...prev, nightDrops: 0 }));
  }, []);
  
  const updateSetting = (key, value) => {
    if (key == "loginNextDay" && nextDaySeeds == "") {
      toast.error("Next Day tags is empty");
      return;
    }
    setModalSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-2xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Splitter Settings</h2>
          <button
            onClick={() => updateSetting("isOpen", false)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Use Fixed Quantity */}
          {selectedEntity != 7 && (
            <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
              <span className="text-gray-700 font-medium">
                Use Fixed Quantity
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={useFixedQuantity}
                  onChange={() => updateSetting("useFixedQuantity", !useFixedQuantity)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          )}

          {/* Fixed Quantity Input */}
          {useFixedQuantity && (
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fixed Quantity
              </label>
              <input
                type="number"
                value={fixedQuantity}
                onChange={(e) => updateSetting("fixedQuantity", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          )}

          {selectedEntity == 7 && (
            <>
              {/* MORNING INPUTS */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                  Morning Settings
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Drops Number
                    </label>
                    <input
                      type="number"
                      value={morningDrops}
                      onChange={(e) => {
                        const newMorning = parseInt(e.target.value, 10);
                        if (newMorning > timedrops.length) return;
                        updateSetting("morningDrops", newMorning);
                        updateSetting("nightDrops", timedrops.length - newMorning);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={morningDropsQuantity}
                      onChange={(e) =>
                        updateSetting("morningDropsQuantity", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* NIGHT INPUTS */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                  Night Settings
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Drops Number
                    </label>
                    <input
                      type="number"
                      value={nightDrops}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={nightDropsQuantity}
                      onChange={(e) =>
                        updateSetting("nightDropsQuantity", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Time Type Input*/}
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Type
            </label>
            <input
              type="number"
              value={timeType}
              onChange={(e) => updateSetting("timeType", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {/* Toggle Settings */}
          <div className="space-y-3">
            {/* Shuffle Toggle */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
              <span className="text-gray-700 font-medium">Apply Shuffle</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={shuffle}
                  onChange={() => updateSetting("shuffle", !shuffle)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* ScheduleTasks Toggle */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
              <span className="text-gray-700 font-medium">Schedule Tasks</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={scheduleTasks}
                  onChange={() => updateSetting("scheduleTasks", !scheduleTasks)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Fast Kill Toggle */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
              <span className="text-gray-700 font-medium">Fast Kill</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={fastKill}
                  onChange={() => updateSetting("fastKill", !fastKill)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Login Next Day Toggle */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
              <span className="text-gray-700 font-medium">Login Next Day</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={loginNextDay}
                  onChange={() => updateSetting("loginNextDay", !loginNextDay)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => updateSetting("isOpen", false)}
            className="px-5 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              updateSetting("isOpen", false);
              onApply();
            }}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            Apply Settings
          </button>
        </div>
      </motion.div>
    </div>
  );
}