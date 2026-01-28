import React, { useState } from "react";
import { updateEntity } from "../../api/apiService";
import { toast } from "react-toastify";
import { X, Save } from "lucide-react";

const TimeDropsModal = ({
  isOpen,
  onClose,
  timeDrops,
  setTimeDrops,
  entityId,
  entityName,
}) => {
  if (!isOpen) return null;

  const [editedTimeDrops, setEditedTimeDrops] = useState(timeDrops.join("\n"));
  const [IstimeDropsChanged, setIsTimeDropsChanged] = useState(false);

  const handleChange = (event) => {
    setEditedTimeDrops(event.target.value);
    setIsTimeDropsChanged(true);
  };

  const handleSaveChanges = async () => {
    const formattedData = {
      name: entityName,
      timedrops: editedTimeDrops.replace(/\n/g, ","),
    };
    setTimeDrops(formattedData.timedrops.split(","));
    onClose();
    // try {
    //   const response = await updateEntity(entityId, formattedData);
    //   toast.success("Time drops updated successfully!");
    //   setTimeDrops(response.timedrops.split(","));
    //   onClose();
    // } catch (error) {
    //   console.error("Error updating time drops:", error);
    //   toast.error("Failed to update time drops.");
    // }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-gray-50">
          <h2 className="text-2xl font-bold text-gray-800">
            Time Drops for {entityName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Enter time drops (one per line)
            </label>
            <textarea
              className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
              value={editedTimeDrops}
              onChange={handleChange}
              placeholder="Enter time drops here..."
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
          {IstimeDropsChanged && (
            <>
              {" "}
              <button
                onClick={handleSaveChanges}
                className="flex items-center gap-2 px-5 py-2 text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Locally
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeDropsModal;
