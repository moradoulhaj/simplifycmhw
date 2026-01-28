import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { createEntity, createSession, updateSession } from "../../api/apiService";

const EntityModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    id :"null",
    name: "CMH",
    timedrops:
      "11:00,12:00,13:00,14:00,15:00,16:00,17:00,18:00,19:00,20:00,21:00,22:00,23:00,00:00,01:00,02:00,03:00,04:00,05:00",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value.trimStart(), // Prevents leading spaces while typing
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Trim all input values before submission
    const trimmedData = {
      ...formData,
      name: formData.name.trim(),
      timedrops: formData.timedrops.trim(),
    };

    // Ensure required fields are not empty after trimming
    if (!trimmedData.name || !trimmedData.timedrops) {
      toast.error("All fields are required.");
      return;
    }

    try {
      const response = await createEntity (trimmedData);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || "Error saving session.");
    }
  };

  return isOpen ? (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
      <ToastContainer theme="colored" />

      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          Add Entity
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entity Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Enter session name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              TimeDrops <span className="text-red-500">*</span>
            </label>
            <textarea
              name="timedrops"
              value={formData.timedrops.split(",").join("\n")}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500 h-40"
              placeholder="Enter Time drops \n separated"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;
};

export default EntityModal;
