import React, { useState } from "react";
import { toast } from "react-toastify";
import { RotateCcw, X, Save } from "lucide-react";

const NextDayModal = ({ isOpen, onClose, nextDaySeeds, setNextDaySeeds }) => {
  if (!isOpen) return null;

  const [isNextDayEdited, setIsNextDayEdited] = useState(false);

  const handleChange = (event) => {
    setNextDaySeeds(event.target.value);
    setIsNextDayEdited(true);
  };

  const handleReset = () => {
    setNextDaySeeds("");
    setIsNextDayEdited(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-gray-50">
          <h2 className="text-2xl font-bold text-gray-800">Next Day Seeds Configuration</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              className="p-2 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
              title="Reset seeds"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Enter seeds for next day invluding the day number.
            </label>
            <textarea
              className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
              value={nextDaySeeds}
              onChange={handleChange}
              placeholder="Enter seeds here..."
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          {isNextDayEdited && (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-5 py-2 text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NextDayModal;