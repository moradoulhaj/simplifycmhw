import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Pencil, Trash, Plus, FolderSymlink } from "lucide-react";
import SessionModal from "./DashboardComponents/SessionModal";

import {
  deleteSession,
  fetchEntityId,
  fetchEntities,
  updateEntity,
  deletePlan,
} from "../api/apiService";
import MoveSessionModal from "./DashboardComponents/MoveSessionModal ";
import EntityModal from "./DashboardComponents/EntityModal";

const AdminDashboard = () => {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [selectedEntityName, setSelectedEntityName] = useState(null);

  const [sessionData, setSessionData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [entityModalOpen, setEntityModalOpen] = useState(false);

  const [editSession, setEditSession] = useState(null);
  const [timeDrops, setTimeDrops] = useState([]);
  const [entities, setEntities] = useState([]);

  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [sessionToMove, setSessionToMove] = useState(null);

  // updating time drops
  const handleSaveTimeDrops = async () => {
    try {
      const formattedData = {
        name: selectedEntityName,
        timedrops: timeDrops.filter(Boolean).join(","),
      };

      const response = await updateEntity(selectedEntity, formattedData);
      toast.success("Time drops updated successfully!");
    } catch (error) {
      toast.error("Failed to update time drops.");
    }
  };

  // Fetch all entities on mount
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

  // Fetch sessions and timeDrops when selectedEntity changes
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedEntity) return;
      try {
        const data = await fetchEntityId(selectedEntity);
        console.log(data);
        setSelectedEntityName(data.name);
        const sortedSessions = (data.sessions || []).sort(
          (a, b) => a.index - b.index
        );
        setSessionData(sortedSessions);
        setTimeDrops(data.timedrops?.split(",") || []);
      } catch (error) {
        toast.error("Failed to fetch session data.");
      }
    };
    fetchData();
  }, [selectedEntity, entityModalOpen]);
  const handleEntityDelete = async (id) => {
    if (
      window.confirm(
        `Are you sure you want to delete the plan: ${selectedEntityName}?`
      )
    ) {
      try {
        console.log(id);
        const res = await deletePlan(id);
        entities.filter((en))

        toast.success("Plan deleted successfully!");
      } catch {
        toast.error("Failed to delete Plan.");
      }
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this session?")) {
      try {
        await deleteSession(id);
        setSessionData((prev) => prev.filter((s) => s.id !== id));
        toast.success("Session deleted successfully!");
      } catch {
        toast.error("Failed to delete session.");
      }
    }
  };
  const handleMove = (session) => {
    setSessionToMove(session);
    setMoveModalOpen(true);
  };

  return (
    <div className="p-8 max-w-[1500px] mx-auto bg-gray-100 min-h-screen">
      <ToastContainer theme="colored" />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
        <button
          className="flex items-center bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-700 transition"
          type="button"
          onClick={() => setEntityModalOpen(true)}
        >
          Add Entity
        </button>
      </div>

      <div className="w-full bg-white shadow-md rounded-lg p-4 mb-4 flex items-center justify-between">
        <div>
          <label htmlFor="entitySelect" className="text-gray-700 font-medium">
            Select Entity:
          </label>
          <select
            id="entitySelect"
            value={selectedEntity || ""}
            onChange={(e) => setSelectedEntity(parseInt(e.target.value))}
            className="w-48 py-2 px-3 border shadow-md rounded focus:ring focus:border-blue-500 transition ml-4"
          >
            {entities.map((entity) => (
              <option key={entity.id} value={entity.id}>
                {entity.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-5">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Session
          </button>
          <button
            onClick={() => handleEntityDelete(selectedEntity)}
            className="flex items-center bg-red-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-red-700 transition"
          >
            <Trash className="w-5 h-5 mr-2" /> Delete Plan
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-[14%] bg-white shadow-md rounded-lg p-4 flex flex-col">
          <label className="text-gray-700 font-medium bg-blue-100 border py-3 px-2 rounded">
            Time Drops:
            <span className="inline-flex items-center rounded-md bg-blue-100 px-2 ml-1 text-xs font-medium ring-1 ring-inset ring-blue-700/10 text-blue-700">
              {timeDrops.length}
            </span>
          </label>
          <textarea
            value={timeDrops.join("\n")}
            onChange={(e) => setTimeDrops(e.target.value.split("\n"))}
            className="flex-grow p-3 border rounded bg-white resize-none mt-2 text-center"
          />
          <button
            onClick={handleSaveTimeDrops}
            className="mt-2 bg-green-600 text-white py-2 rounded shadow-md hover:bg-green-700 transition"
          >
            Save Time Drops
          </button>
        </div>

        <div className="w-full md:w-[86%] bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-blue-100 text-gray-700">
                <th className="border p-3">Order</th>
                <th className="border p-3">Name</th>
                <th className="border p-3">Username</th>
                <th className="border p-3">Script</th>
                <th className="border p-3">Config</th>
                <th className="border p-3">Status</th>
                <th className="border p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessionData.length > 0 ? (
                sessionData.map((session) => (
                  <tr
                    key={session.id}
                    className="text-center hover:bg-gray-50 transition"
                  >
                    <td className="border p-2">{session.index}</td>
                    <td className="border p-2">{session.name}</td>
                    <td className="border p-2">{session.username || "N/A"}</td>
                    <td className="border p-2">{session.script || "N/A"}</td>
                    <td className="border p-2">{session.config || "N/A"}</td>
                    <td className="border p-2">
                      {session.isActive ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded">
                          Active
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="border p-2 flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setEditSession(session);
                          setModalOpen(true);
                        }}
                        className="flex items-center bg-yellow-500 text-white px-3 py-2 rounded-md shadow-md hover:bg-yellow-600 transition"
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                      </button>
                      <button
                        onClick={() => handleMove(session)}
                        className="flex items-center bg-red-600 text-white px-3 py-2 rounded-md shadow-md hover:bg-red-700 transition"
                      >
                        <FolderSymlink className="w-4 h-4 mr-2" />
                      </button>

                      <button
                        onClick={() => handleDelete(session.id)}
                        className="flex items-center bg-red-600 text-white px-3 py-2 rounded-md shadow-md hover:bg-red-700 transition"
                      >
                        <Trash className="w-4 h-4 mr-2" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-gray-500 p-4">
                    No sessions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <SessionModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditSession(null);
          }}
          session={editSession}
          setSessionData={setSessionData}
          entityId={selectedEntity}
        />
      )}

      {entityModalOpen && (
        <EntityModal
          isOpen={entityModalOpen}
          onClose={() => {
            setEntityModalOpen(false);
          }}
        />
      )}
      {moveModalOpen && sessionToMove && (
        <MoveSessionModal
          isOpen={moveModalOpen}
          onClose={() => setMoveModalOpen(false)}
          session={sessionToMove}
          entities={entities}
          onSessionMoved={(movedId) => {
            setSessionData((prev) => prev.filter((s) => s.id !== movedId));
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
