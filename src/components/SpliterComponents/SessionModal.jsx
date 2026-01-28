import React, { useState } from "react";
import { updateSessionStatuses } from "../../api/apiService";
import { toast } from "react-toastify";
import { X, Save } from "lucide-react";

const SessionModal = ({ isOpen, setSessionModalOpen, sessionData }) => {
  if (!isOpen) return null;

  const [updatedSessions, setUpdatedSessions] = useState(sessionData);
  const [isSessionsUpdated, setIsSessionsUpdated] = useState(false);

  const HandleModalClose = () => {
    setUpdatedSessions(sessionData);
    setSessionModalOpen(false);
  };

  const handleStatusChange = (index) => {
    const newSessions = [...updatedSessions];
    newSessions[index].isActive = !newSessions[index].isActive;
    setUpdatedSessions(newSessions);
    setIsSessionsUpdated(true);
  };

  const handleSaveChanges = async () => {
    try {
      const sessionsToUpdate = updatedSessions.map((session) => ({
        id: session.id,
        status: session.isActive,
      }));

      await updateSessionStatuses(sessionsToUpdate);
      toast.success("Session statuses updated successfully!");
      setSessionModalOpen(false);
    } catch (error) {
      console.error("Error updating session statuses:", error);
      toast.error("Failed to update session statuses.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-4 bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-gray-50">
          <h2 className="text-2xl font-bold text-gray-800">Session Management</h2>
          <button
            onClick={HandleModalClose}
            className="p-1 text-gray-500 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Script
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Config
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {updatedSessions.map((session, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {session.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.script}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.config}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer"
                      onClick={() => handleStatusChange(index)}
                    >
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          session.isActive
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        } transition-colors`}
                      >
                        {session.isActive ? "Active" : "Paused"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={HandleModalClose}
            className="flex items-center gap-2 px-5 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          {isSessionsUpdated && (
            <button
              onClick={handleSaveChanges}
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

export default SessionModal;