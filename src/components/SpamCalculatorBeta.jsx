import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import TextAreaInput from "./smalls/logCheckerSmalls/TextAreaInput";
import TableDisplay from "./smalls/TableSpam";
import TableSpam from "./smalls/TableSpam";

export default function SpamCalculatorBeta() {
  const [profiles, setProfiles] = useState("");
  const [profilesWithSpam, setProfilesWithSpam] = useState("");
  const [matchedSessions, setMatchedSessions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modeToTable, setModeToTable] = useState("");
  const [deployInput, setDeployInput] = useState("");

  const handleSubmit = (e, mode, deployIDs = []) => {
    e.preventDefault();
    setModeToTable(mode);

    if (!profiles.trim()) {
      toast.error("Please enter valid profiles!");
      return;
    }

    const rows = profiles
      .trim()
      .split("\n")
      .map((line) => line.split("\t"));

    const sessions = rows[0].map((_, colIndex) =>
      rows.map((row) => [row[colIndex], ""]).filter(([profile]) => profile)
    );

    const profilesWithSpamArr = profilesWithSpam
      .trim()
      .split("\n")
      .filter((line) => /^\d+\s+❯\s+\d+/.test(line))
      .map((line) => {
        const match = line.match(/^(\d+)\s+❯\s+(\d+)/);
        return match ? [match[1], match[2]] : null;
      })
      .filter(Boolean);

    const spamMap = new Map(profilesWithSpamArr);

    const profileCount = new Map();
    sessions.flat().forEach(([profile]) => {
      if (profile)
        profileCount.set(profile, (profileCount.get(profile) || 0) + 1);
    });

    let newMatchedSessions = sessions.map((session) =>
      session.map(([profile]) => {
        const spamNumber = spamMap.get(profile) || "";
        const isDuplicate = profileCount.get(profile) > 1;
        return [profile, isDuplicate ? `${spamNumber} D` : spamNumber];
      })
    );

    // newMatchedSessions = newMatchedSessions.map((session) =>
    //   session.sort((a, b) => Number(a[0]) - Number(b[0]))
    // );
    if (mode === "deploy") {
        if (deployIDs.length === 0) {
          toast.error("Please enter valid deployment IDs.");
          return;
        }
      
        // Flatten all profiles in session order
        const allProfiles = [];
        for (const session of newMatchedSessions) {
          for (const profile of session) {
            allProfiles.push(profile);
          }
        }
      
        const total = allProfiles.length;
        const nbrDeploys = deployIDs.length;
        const sliceSize = Math.floor(total / nbrDeploys);
        const remainder = total % nbrDeploys;
      
        let from = 0;
        const deploySessions = [];
      
        for (let g = 0; g < nbrDeploys; g++) {
          const extra = g < remainder ? 1 : 0;
          const to = from + sliceSize + extra;
          const slice = allProfiles.slice(from, to);
          deploySessions.push(slice);
          from = to;
        }
        console.log(deploySessions)
      
        // Add deployment ID headers
        newMatchedSessions = deploySessions.map((profiles, idx) => [
          [`ID: ${deployIDs[idx]}`, ""],
          ...profiles,
        ]);
      }
      

    setMatchedSessions(newMatchedSessions);
    toast.success("Profiles processed successfully!");
  };

  const handleDeployConfirm = (e) => {
    const ids = deployInput
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id);

    if (ids.length === 0) {
      toast.error("Invalid deploy ID input");
      return;
    }

    setIsModalOpen(false);
    handleSubmit(e, "deploy", ids);
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
                placeholder="Enter profiles with spam: 1111 ❯ 2"
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
              className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition duration-300"
              onClick={() => setIsModalOpen(true)}
            >
              Match By Deploy
            </button>
          </div>
        </form>

        <hr className="mt-8 border-blue-300" />

        {matchedSessions.length > 0 && (
          <TableSpam
            matchedSessions={matchedSessions}
            modeToTable={modeToTable}
          />
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Enter Deployment IDs
            </h2>
            <input
              type="text"
              className="w-full border rounded p-2 text-center"
              placeholder="e.g. 125448,45682,56487"
              value={deployInput}
              onChange={(e) => setDeployInput(e.target.value)}
            />
            <div className="flex justify-between mt-4">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={handleDeployConfirm}
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
