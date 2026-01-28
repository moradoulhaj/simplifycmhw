import { useState } from "react";
import { toast } from "react-toastify";
import { MoveRight, XCircle } from "lucide-react";
import { moveSession } from "../../api/apiService";

const MoveSessionModal = ({
  isOpen,
  onClose,
  session,
  entities,
  onSessionMoved,
}) => {
  const [targetEntityId, setTargetEntityId] = useState("");

  const handleMove = async () => {
    if (!targetEntityId || targetEntityId == session.entityId) {
      toast.error("Please select a valid target entity.");
      return;
    }

    try {
      const response = await moveSession(session.id, parseInt(targetEntityId));
      console.log(response);
    //   if (!response.ok) throw new Error();

      toast.success("Session moved successfully!");
      onSessionMoved(session.id);
      onClose();
    } catch {
      toast.error("Failed to move session.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
        <h2 className="text-lg font-bold mb-4">Move Session</h2>

        <label className="block mb-2 text-sm text-gray-700">
          Select Target Entity
        </label>
        <select
          className="w-full border rounded px-3 py-2 mb-4"
          value={targetEntityId}
          onChange={(e) => setTargetEntityId(e.target.value)}
        >
          <option value="">-- Choose Entity --</option>
          {entities
            .filter((e) => e.id !== session.entityId)
            .map((entity) => (
              <option key={entity.id} value={entity.id}>
                {entity.name}
              </option>
            ))}
        </select>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="flex items-center px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Cancel
          </button>
          <button
            onClick={handleMove}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <MoveRight className="w-4 h-4 mr-2" />
            Move
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveSessionModal;
