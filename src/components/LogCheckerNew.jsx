import { useState, useEffect } from "react";
import { checkLogs, checkLogsNew } from "../scripts/checker";
import Monitor from "./smalls/logCheckerSmalls/Monitor";
import TextAreaInput from "./smalls/logCheckerSmalls/TextAreaInput";
import { ToastContainer, toast } from "react-toastify";

export default function LogCheckerNew() {
  const [profiles, setProfiles] = useState("");
  const [logs, setLogs] = useState("");
  const [sent, setSent] = useState(false);
  const [result, setResult] = useState({});
  const [combined, setCombined] = useState("");

  useEffect(() => {
    if (combined.trim() === "") {
      setSent(false);
      return;
    }

    const lines = combined.split("\n");
    const profilesAndTags = lines.map((line) => line.split("\t"));

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

    const result = checkLogsNew(profiles, logs);
    setResult(result);
    setSent(true);
  }, [combined]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 py-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-md p-8 border border-blue-200">
        <h1 className="text-2xl font-semibold text-blue-700 mb-6 text-center">
          Log Checker
        </h1>

        <form className="space-y-6">
          <TextAreaInput
            id="profiles"
            label="Profiles & Logs"
            value={combined}
            onChange={(e) => setCombined(e.target.value)}
            placeholder="Paste profiles with logs (tab-separated)"
          />
        </form>

        <div className="mt-2 border-t pt-2 border-blue-200 text-sm text-gray-500 text-center">
          <br /><code>XXXX	[XXXXXXXXXXXXXXXXX]	Active ; Update_status : active</code>
        </div>
      </div>

      {sent && (
        <div className="mt-10 w-full max-w-5xl">
          <Monitor result={result} />
        </div>
      )}

      <ToastContainer theme="colored" autoClose={1500} />
    </main>
  );
}
