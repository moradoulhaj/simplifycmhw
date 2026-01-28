export default function LogsModal({ isOpen, onClose, logs = [], profiles = [] }) {
    if (!isOpen) return null;
  
    // Pair profiles with logs
    const logsWithProfiles = profiles.map((profile, index) => 
      `${profile} - ${logs[index] || "No log available"}`
    );
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-1/3 relative animate-fadeIn">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-xl font-semibold text-gray-800">Logs</h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 transition duration-200"
            >
              ✖
            </button>
          </div>
  
          {/* Scrollable Logs Container */}
          <div className="border border-gray-300 rounded-lg bg-gray-50 p-3 max-h-80 overflow-auto">
            <pre className="text-sm font-mono text-gray-800 whitespace-pre overflow-x-auto pb-1">
              {logsWithProfiles.length > 0 
                ? logsWithProfiles.join("\n") 
                : "No logs available"}
            </pre>
          </div>
  
          {/* Footer */}
          <div className="flex justify-end mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200 shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
  