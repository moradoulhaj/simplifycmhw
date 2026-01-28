import React, { useState } from "react";
import { handleExcel } from "../scripts/scripts";

function ProxieDuplication() {
  const [profilesText, setProfilesText] = useState("");
  const [maxDuplicate, setMaxDuplicate] = useState();

  // To split the input into sessions.
  const parseSessions = () => {
    const lines = profilesText.trim().split("\n");

    // Split header: ["CMH5_IT_1", "", "CMH5_IT_2", "", "CMH5_IT_3", ""]
    // We only want real session names
    const rawHeader = lines[0].split("\t");
    const sessions = rawHeader.filter((h) => h.trim() !== "");

    const result = {};
    sessions.forEach((s) => (result[s] = {}));

    const sessionCount = sessions.length;

    for (let i = 1; i < lines.length; i++) {
      // Use split("\t") NOT split(/\s+/), because tabs matter
      const cols = lines[i].split("\t");

      let c = 0; // column pointer

      for (let s = 0; s < sessionCount; s++) {
        const profile = cols[c]?.trim();
        const proxy = cols[c + 1]?.trim();

        // Only add if BOTH profile & proxy exist
        if (profile && proxy) {
          result[sessions[s]][profile] = proxy;
        }

        c += 2; // move to next session’s 2 columns
      }
    }
    return result;
  };

  const checkDuplicated = (result) => {
    const counter = {}; // proxy -> count

    // Loop all sessions
    Object.values(result).forEach((session) => {
      // session = { profile : proxy }
      Object.values(session).forEach((proxy) => {
        if (!counter[proxy]) counter[proxy] = 0;
        counter[proxy]++;
      });
    });

    return counter;
  };

  // The main logic resides here.
  const processClick = () => {
    const result = parseSessions();
    const proxyWithNumber = checkDuplicated(result);

    const toChangeProxies = Object.entries(proxyWithNumber)
      .filter(([proxy, count]) => count > Number(maxDuplicate))
      .map(([proxy, count]) => ({
        proxy,
        excess: count - Number(maxDuplicate),
      }));
    console.log("sdfsdsd0df",toChangeProxies)
    // Map session -> profiles to change
    const SessionProfileMap = {};
    Object.keys(result).forEach((session) => (SessionProfileMap[session] = []));

    toChangeProxies.forEach(({ proxy, excess }) => {
      const profilesList = [];

      // Collect all profiles with this proxy
      Object.entries(result).forEach(([sessionName, sessionProfiles]) => {
        Object.entries(sessionProfiles).forEach(([profile, p]) => {
          if (p === proxy) {
            profilesList.push({ sessionName, profile });
          }
        });
      });
      // Select `excess` profiles to change
      const profilesToChange = profilesList.slice(0, excess);

      profilesToChange.forEach(({ sessionName, profile }) => {
        SessionProfileMap[sessionName].push(profile);
      });
    });

    // Generate the file text
    let fileText = "";
    Object.entries(SessionProfileMap).forEach(([session, profiles]) => {
      if (profiles.length > 0) {
        fileText += session + "\n";
        profiles.forEach((p) => {
          fileText += p + "\n";
        });
        fileText += "\n";
      }
    });

    // Create a blob and download the file
    const blob = new Blob([fileText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ProfilesToChange.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    // Outer container: Centered, max width, nice background, and padding
    <div className="mx-[250px] p-6 bg-white  rounded-xl border border-gray-200 h-[100%]">
      {/* Title/Header (Optional, but good practice) */}
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Profile & Proxy Duplication Tool
      </h2>

      {/* Form area: Clean, vertical spacing */}
      <div className="flex flex-col gap-5">
        {/* Label: Clear and distinct */}
        <div className="flex justify-between">
          <label
            htmlFor="profile-proxy-input"
            className="text-lg font-medium text-gray-700 "
          >
            Put your Profiles and Proxies here (Tab-separated):
          </label>

          <input
            type="number"
            min="1"
            className="w-1/4 left border border-gray-300 rounded-lg p-2  focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter max duplicates"
            value={maxDuplicate}
            onChange={(e) => setMaxDuplicate(e.target.value)}
          />
        </div>

        {/* Textarea: Large, good contrast, focus state, and resize control */}
        <textarea
          value={profilesText}
          onChange={(e) => setProfilesText(e.target.value)}
          name="profile-proxy-input"
          id="profile-proxy-input"
          rows={30}
          cols={5}
          className="w-full p-3 border border-gray-300 rounded-lg h-[70%] focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-mono resize-y"
          placeholder="e.g., ProfileName\t1.2.3.4:8080"
        ></textarea>

        {/* Button: Primary action style, hover effect, full width, and accessible padding */}
        <button
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold rounded-lg transition duration-200 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
          type="button"
          onClick={processClick}
        >
          Process Data
        </button>
      </div>
    </div>
  );
}

export default ProxieDuplication;
