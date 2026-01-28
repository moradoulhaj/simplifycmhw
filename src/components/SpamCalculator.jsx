import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import TextAreaInput from "./smalls/logCheckerSmalls/TextAreaInput";
import TableDisplay from "./smalls/TableSpam";

export default function SpamCalculator() {
  const [profiles, setProfiles] = useState("");
  const [profilesWithSpam, setProfilesWithSpam] = useState("");
  const [matchedSessions, setMatchedSessions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modeToTable, setModeToTable] = useState("");

  const [deployCount, setDeployCount] = useState("");
  const [deployProfileCounts, setDeployProfileCounts] = useState([]);

  const handleSubmit = async (e, mode, deployCounts = null) => {
    e.preventDefault();
    setModeToTable(mode);
    if (!profiles?.trim()) {
      toast.error("Please enter valid profiles!");
      return;
    }

    const profilesWithSpamData = profilesWithSpam.trim() || "";

    // Step 1: Convert profiles input into an array
    const rows = profiles
      .trim()
      .split("\n")
      .map((line) => line.split("\t"));

    // Step 2: Convert rows into sessions (column-based grouping)
    let sessions = rows[0].map((_, colIndex) =>
      rows.map((row) => [row[colIndex], ""]).filter(([profile]) => profile)
    );

    // // Step 3: Convert profilesWithSpam input into a lookup map
    // const profilesWithSpamArr = profilesWithSpamData
    //   .split("\n")
    //   .map((line) => line.split("\t"));

    const profilesWithSpamArr = profilesWithSpamData
      .split("\n")
      .filter((line) => /^\d+\s+❯\s+\d+\s+-/.test(line)) // lines with profile ❯ spam
      .map((line) => {
        const match = line.match(/^(\d+)\s+❯\s+(\d+)/);
        return match ? [match[1], match[2]] : null;
      })
      .filter(Boolean); // remove null entries
    console.log(profilesWithSpamArr);
    const spamMap = new Map(profilesWithSpamArr);
    // const profilesWithSpamArr = profilesWithSpamData
    //   .split("\n")
    //   .map((line) => line.split("\t"));
    // const spamMap = new Map(profilesWithSpamArr);

    // Step 4: Count occurrences of each profile
    const profileCount = new Map();
    sessions.flat().forEach(([profile]) => {
      if (profile)
        profileCount.set(profile, (profileCount.get(profile) || 0) + 1);
    });

    // Step 5: Assign spam numbers and mark duplicates
    let newMatchedSessions = sessions.map((session) =>
      session.map(([profile]) => {
        const spamNumber = spamMap.get(profile) || "";
        const isDuplicate = profileCount.get(profile) > 1;
        return [profile, isDuplicate ? `${spamNumber} D` : spamNumber];
      })
    );

    // Step 6: Sort profiles numerically
    newMatchedSessions = newMatchedSessions.map((session) =>
      session.sort((a, b) => Number(a[0]) - Number(b[0]))
    );

    // Step 7: Deploy Logic - Distribute Profiles
    if (mode === "deploy") {
      if (!deployCounts || deployCounts.length === 0) {
        toast.error("Please enter valid deploy profile counts!");
        return;
      }

      let allProfiles = newMatchedSessions.flat(); // Flatten all sessions

      let deployIndex = 0;
      let deploySessions = deployCounts.map(() => []); // Initialize empty deploy arrays

      for (let deploySize of deployCounts) {
        let assignedProfiles = allProfiles.splice(0, deploySize);
        deploySessions[deployIndex] = assignedProfiles;
        deployIndex++;
      }

      newMatchedSessions = deploySessions;
    }

    setMatchedSessions(newMatchedSessions);
    toast.success("Profiles matched successfully!");
  };

  return (
    <main className="min-h-[85vh] bg-gradient-to-br from-blue-100 via-white to-blue-50 flex flex-col items-center py-10">
      <div className="px-5 mt-4 w-full max-w-4xl">
        <form className="space-y-8">
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <div className="w-full md:w-1/2">
              <TextAreaInput
                id="profiles"
                value={profiles}
                label="Profiles And Logs"
                placeholder="Enter profiles by sessions:"
                onChange={(e) => setProfiles(e.target.value)}
              />
            </div>
            <div className="w-full md:w-1/2">
              <TextAreaInput
                id="profilesWithSpam"
                value={profilesWithSpam}
                label="Profiles With Spam"
                placeholder="Enter profiles with spam: 1111 2"
                onChange={(e) => setProfilesWithSpam(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-center gap-10 mt-6">
            <button
              type="button"
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
              onClick={(e) => handleSubmit(e, "session")}
            >
              Match By Session
            </button>
            <button
              type="button"
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
              onClick={() => setIsModalOpen(true)}
            >
              Match By Deploy
            </button>
          </div>
        </form>
        <hr className="mt-8 border-blue-300" />

        {/* Render table only if matchedSessions has data */}
        {matchedSessions.length > 0 && (
          <TableDisplay
            matchedSessions={matchedSessions}
            modeToTable={modeToTable}
          />
        )}
      </div>

      {/* Modal for Deploy Count */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Enter Deploy Info
            </h2>
            <input
              type="number"
              className="w-full border rounded p-2 text-center"
              placeholder="Number of Deploys"
              value={deployCount}
              onChange={(e) => {
                const count = parseInt(e.target.value, 10) || 0;
                setDeployCount(count);
                setDeployProfileCounts(new Array(count).fill(""));
              }}
            />
            {deployProfileCounts.map((_, i) => (
              <input
                key={i}
                type="number"
                className="w-full border rounded p-2 mt-2 text-center"
                placeholder={`Profiles for Deploy ${i + 1}`}
                value={deployProfileCounts[i]}
                onChange={(e) => {
                  let newCounts = [...deployProfileCounts];
                  newCounts[i] = e.target.value;
                  setDeployProfileCounts(newCounts);
                }}
              />
            ))}
            <div className="flex justify-between mt-4">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={(e) => {
                  setIsModalOpen(false);
                  handleSubmit(e, "deploy", deployProfileCounts);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer theme="colored" autoClose={1500} />
    </main>
  );
}
