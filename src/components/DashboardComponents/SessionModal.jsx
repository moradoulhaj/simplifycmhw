import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { createSession, updateSession } from "../../api/apiService";

const SessionModal = ({ isOpen, onClose, session, setSessionData, entityId }) => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    script: "",
    config: "",
    isActive: false,
    dep: entityId, 
    index:"",
  });

  useEffect(() => {
    if (session) {
      setFormData({ ...session, dep: entityId });
    }
  }, [session, entityId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === "checkbox" ? checked : value.trimStart() // Prevents leading spaces while typing
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Trim all input values before submission
    const trimmedData = {
      ...formData,
      name: formData.name.trim(),
      script: formData.script.trim(),
      config: formData.config.trim(),
      username: formData.username.trim(), 
    };

    // Ensure required fields are not empty after trimming
    if (!trimmedData.name || !trimmedData.script || !trimmedData.config || !trimmedData.username ) {
      toast.error("All fields are required.");
      return;
    }

    try {
      const sessionData = { ...trimmedData, dep: { id: trimmedData.dep } };

      if (session) {
        const updatedSession = await updateSession(session.id, sessionData);
        setSessionData((prev) =>
          prev.map((s) => (s.id === session.id ? updatedSession : s))
        );
        toast.success("Session updated successfully!");
      } else {
        const newSession = await createSession(sessionData);
        setSessionData((prev) => [...prev, newSession]);
        toast.success("Session created successfully!");
      }

      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || "Error saving session.");
    }
  };

  return isOpen ? (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
      <ToastContainer theme="colored" />

      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {session ? "Edit Session" : "Add Session"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Order <span className="text-red-500">*</span>
            </label>
            <input
              name="index"
              value={formData.index}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Enter session name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Name <span className="text-red-500">*</span>
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
              Username <span className="text-red-500">*</span>
            </label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Script <span className="text-red-500">*</span>
            </label>
            <input
              name="script"
              value={formData.script}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Enter script"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Config <span className="text-red-500">*</span>
            </label>
            <input
              name="config"
              value={formData.config}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Enter config"
              required
            />
          </div>

          <input type="hidden" name="dep" value={formData.dep} />

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="mr-2"
            />
            <label className="text-sm font-medium text-gray-700">Active</label>
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

export default SessionModal;
