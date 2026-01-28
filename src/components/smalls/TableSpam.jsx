import React from "react";
import { toast } from "react-toastify";

export default function TableSpam({ matchedSessions, modeToTable }) {
  if (!matchedSessions || matchedSessions.length === 0) {
    return <p className="text-center text-gray-500">No data available</p>;
  }

  // Check if mode is deploy and if sessions start with ID header row
  const isDeployMode = modeToTable === "deploy";
  
  // Extract deploy IDs if in deploy mode
  const deployIDs = isDeployMode
    ? matchedSessions.map(session => {
        const firstProfile = session[0]?.[0] || "";
        if (firstProfile.startsWith("ID: ")) return firstProfile;
        return null;
      })
    : [];

  // For rendering rows, exclude header row in deploy mode sessions
  const sessionsData = isDeployMode
    ? matchedSessions.map(session => session.slice(1))
    : matchedSessions;

  // Determine max number of rows in any session (after removing header rows in deploy mode)
  const maxRows = Math.max(...sessionsData.map(session => session.length));

  // Calculate total profiles count excluding header rows
  const totalProfiles = sessionsData.reduce((sum, session) => sum + session.length, 0);

  // Copy logic now uses actual deploy IDs if deploy mode
  const handleCopy = (copySpamOnly = false) => {
    // Headers use deployIDs in deploy mode, else generic names
    const headers = (isDeployMode ? deployIDs : matchedSessions.map((_, idx) => {
      return modeToTable === "session" ? `Session ${idx + 1}` : `Deploy ${idx + 1}`;
    })).join("\t");

    const rows = [...Array(maxRows)].map((_, rowIndex) =>
      sessionsData
        .map(session => {
          const profile = session[rowIndex]?.[0] || "-";
          const spam = session[rowIndex]?.[1] ? `(${session[rowIndex][1]})` : "(N)";
          return copySpamOnly ? spam : `${profile} ${spam}`;
        })
        .join("\t")
    );

    const dataToCopy = [headers, ...rows].join("\n");

    navigator.clipboard.writeText(dataToCopy)
      .then(() => toast.info(copySpamOnly ? "Spam copied!" : "Profiles with spam copied!"))
      .catch(() => toast.info("Failed to copy!"));
  };

  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-blue-600 text-white">
            {/* Use deployIDs as headers if deploy mode, else generic */}
            {(isDeployMode ? deployIDs : matchedSessions).map((sessionOrId, index) => {
              // If deploy mode, sessionOrId is string header; else session array
              const headerText = isDeployMode ? sessionOrId || `Deploy ${index + 1}` : 
                modeToTable === "session" ? `Session ${index + 1}` : `Deploy ${index + 1}`;
              return (
                <th key={index} className="border p-2 text-center whitespace-nowrap">
                  {headerText}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {[...Array(maxRows)].map((_, rowIndex) => (
            <tr key={rowIndex} className="border">
              {sessionsData.map((session, colIndex) => {
                const profile = session[rowIndex]?.[0] || "-";
                const spam = session[rowIndex]?.[1] ? `(${session[rowIndex][1]})` : "";
                return (
                  <td key={colIndex} className="border p-2 text-center whitespace-nowrap">
                    {profile} {spam}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total profiles count */}
      <p className="mt-4 text-center font-semibold text-gray-700">
        Total Profiles: {totalProfiles}
      </p>

      {/* Copy buttons */}
      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={() => handleCopy(false)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Copy Profiles with Spam
        </button>
        <button
          onClick={() => handleCopy(true)}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          Copy Only Spam
        </button>
      </div>
    </div>
  );
}
