import { useState, useEffect } from "react";
import { checkLogs } from "../scripts/checker"; // Adjust the import path based on your folder structure
import Monitor from "./smalls/logCheckerSmalls/Monitor";
import TextAreaInput from "./smalls/logCheckerSmalls/TextAreaInput";
import { ToastContainer, toast } from "react-toastify";

export default function LogCheckerBeta() {
  const [profiles, setProfiles] = useState("");
  const [logs, setLogs] = useState("");
  const [sent, setSent] = useState(false);
  const [result, setResult] = useState({});
  const [combined, setCombined] = useState("");

  useEffect(() => {
    if (combined === "") {
      setSent(false);
      return;
    }

    // Split the combined input into lines
    const lines = combined.split("\n");
    const profilesAndTags = lines.map((line) => line.split("\t").slice(2,5));
console.log(profilesAndTags)
    const profiles = profilesAndTags
      .map(([profile, tag]) => `${profile}\t${tag || ""}`)
      .join("\n");
    const logs = profilesAndTags.map(([, , log]) => log || "").join("\n");

    setProfiles(profiles);
    setLogs(logs);

    const profilesArr = profiles.split("\n");
    const logsArr = logs.split("\n");

    if (profilesArr.length !== logsArr.length) {
      toast.error("Profiles number and Logs number do not match");
      setSent(false);
      return;
    }

    // Perform the log check
    const result = checkLogs(profiles, logs);
    setResult(result);
    setSent(true);
  }, [combined]); // Trigger effect when `combined` changes

  return (
    <main className="min-h-[85vh] bg-gradient-to-br from-blue-100 via-white to-blue-50 flex flex-col items-center py-10">
      <div className="px-5 mt-4 w-full max-w-5xl">
        <form className="space-y-8">
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <div className="w-full md:w-full">
              <h1 className="bg-red-500 text-white text-center rounded">ON TEST : CTRL + A on all the monitor and app will extract profile + tag + log and delete other useless infos.</h1>
              <TextAreaInput
                id="profiles"
                label="Profiles And Logs"
                value={combined}
                onChange={(e) => setCombined(e.target.value)}
                placeholder="Enter profiles with their logs"
         
              />
            </div>
          </div>
        </form>
        <hr className="mt-8 border-blue-300" />
      </div>
      {sent && (
        <div className="mt-8 w-full max-w-5xl">
          <Monitor result={result} />
        </div>
      )}
<ToastContainer theme="colored" autoClose={1500} />
    </main>
  );
}
