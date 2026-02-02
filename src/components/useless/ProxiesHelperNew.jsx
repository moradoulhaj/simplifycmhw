import React, { useState, useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";
import { Sparkles, Wand } from "lucide-react";

// --- Pure Helper Logic ---
const RESERVED_PREFIXES = [
  "193.84.26", "66.93.129", "195.216.248", "146.19.228", "216.254.88",
  "23.170.247", "198.96.160", "62.106.83", "45.145.176", "206.220.72",
  "204.76.25", "192.124.123",
];

const parseSessionText = (text) => {
  const lines = text.split("\n").map((l) => l.trim().replace(/^"+|"+$/g, "")).filter(Boolean);
  const sessions = {};
  let currentSession = null;

  lines.forEach((line) => {
    if (/^[A-Za-z0-9_]+$/.test(line) && isNaN(Number(line))) {
      currentSession = line;
      sessions[currentSession] = [];
    } else if (!isNaN(Number(line)) && currentSession) {
      sessions[currentSession].push(line);
    }
  });
  return sessions;
};

export default function ProxiesHelperNew() {
  const [data, setData] = useState({ sessions: {}, totalProfiles: 0, prefix: "" });
  const [manualInput, setManualInput] = useState("");
  const [reservedFound, setReservedFound] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  // --- Handlers ---
  const handleInputChange = (value) => {
    const lines = value.split("\n");
    const cleanLines = [];
    const blocked = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const isReserved = RESERVED_PREFIXES.some((pre) => trimmed.startsWith(pre));
      if (isReserved) blocked.push(trimmed);
      else cleanLines.push(trimmed);
    });

    if (blocked.length > 0) {
      setManualInput(cleanLines.join("\n"));
      setReservedFound((prev) => Array.from(new Set([...prev, ...blocked])));
      toast.warning(`Filtered ${blocked.length} reserved IP(s)`);
    } else {
      setManualInput(value);
    }
  };

  const handleSparkClick = () => {
    const lines = manualInput.split("\n");
    const extracted = lines.slice(0,data.totalProfiles)
    setManualInput(extracted.join("\n"))   
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const parsed = parseSessionText(event.target.result);
      const total = Object.values(parsed).reduce((sum, arr) => sum + arr.length, 0);
      setData({ sessions: parsed, totalProfiles: total, prefix: "" });
      toast.success(`Profiles loaded: ${total}`);
    };
    reader.readAsText(file);
  };

  const processAndDownload = () => {
    const proxies = manualInput.split("\n").filter((p) => p.trim()).map((p) => {
      if (p.includes(":")) return p;
      return p.includes(",") ? p.replace(",", ":") : `${p}:92`;
    });

    let content = "";
    let pIdx = 0;
    const sessionKeys = Object.keys(data.sessions);

    sessionKeys.forEach((session) => {
      data.sessions[session].forEach((profile, index) => {
        // Only prepend session name for the first profile in a group
        const prefix = index === 0 ? `${session}\n` : "";
        content += `${prefix}${profile}#${session}#${proxies[pIdx++]}\n`;
      });
    });

    const entityName = sessionKeys[0]?.split("_").filter(e=>e.startsWith("CMH"))[0]|| "File";
    const fileName = `${entityName}_${Math.random().toString(36).substring(2, 8)}`;
    
    const blob = new Blob([content.trim()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    setData((prev) => ({ ...prev, prefix: fileName }));
    setIsGenerated(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.info("Copied!");
  };

  const enteredProxiesCount = useMemo(
    () => manualInput.split("\n").filter((p) => p.trim()).length,
    [manualInput]
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-6 md:p-12 font-sans text-slate-900">
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar theme="colored" />

      <div className="max-w-3xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
            Proxy<span className="text-indigo-600">Sync</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Map session profiles to proxies instantly.</p>
        </header>

        {/* Upload Card */}
        <section className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-white">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[2rem] p-12 bg-slate-50 hover:bg-white hover:border-indigo-300 transition-all cursor-pointer relative group">
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".txt" onChange={handleFileChange} />
            <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            </div>
            <span className="font-bold text-slate-800 text-lg">Upload Session TXT</span>
          </div>

          {data.totalProfiles > 0 && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-8 flex items-center justify-between p-6 bg-slate-900 rounded-3xl text-white">
              <div>
                <p className="text-indigo-400 text-xs font-black uppercase tracking-widest">Ready</p>
                <p className="font-bold text-2xl">{data.totalProfiles} Profiles Found</p>
              </div>
              <button onClick={() => { setShowModal(true); setIsGenerated(false); }} className="bg-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-500 transition-all">
                Enter Proxies
              </button>
            </motion.div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-3xl overflow-hidden flex flex-col max-h-[90vh]">
              
              <div className="px-10 py-6 border-b flex justify-between items-center">
                <h3 className="text-xl font-black">Assigning Proxies</h3>
                <button onClick={() => setShowModal(false)} className="text-2xl text-slate-400 hover:text-slate-600">&times;</button>
              </div>

              <div className="p-10 overflow-y-auto space-y-6">
                {!isGenerated ? (
                  <>
                    <div className="relative">
                      <textarea
                        value={manualInput}
                        onChange={(e) => handleInputChange(e.target.value)}
                        className="w-full h-48 p-6 font-mono text-sm bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-indigo-500 outline-none transition-all resize-none"
                        placeholder={`Paste ${data.totalProfiles} proxies here...`}
                      />
                      <div onClick={handleSparkClick} className={`flex text-center items-center gap-1 absolute bottom-4 right-4 px-3 py-1 hover:cursor-pointer hover:bg-teal-400 rounded-lg text-xs font-black ${enteredProxiesCount === data.totalProfiles ? 'bg-green-500 text-white' : 'bg-slate-200'}`}>
                        { enteredProxiesCount }/{data.totalProfiles }  
                        {enteredProxiesCount >data.totalProfiles &&<Sparkles className="border-l pl-1 border-l-black text-4xl text-7xl"></Sparkles> }
                       

                      </div>
                    </div>

                    {reservedFound.length > 0 && (
                      <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                        <p className="text-red-600 font-bold text-xs uppercase mb-2">Reserved IPs Filtered</p>
                        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                          {reservedFound.map((ip, i) => (
                            <span key={i} onClick={() => copyToClipboard(ip)} className="px-2 py-1 bg-white border text-[10px] font-mono rounded cursor-pointer hover:bg-red-100">{ip}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h4 className="text-2xl font-black">File Downloaded</h4>
                    <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between border-2 border-slate-100">
                      <code className="text-indigo-600 font-bold">{data.prefix}.txt</code>
                      <button onClick={() => copyToClipboard(data.prefix)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold">Copy Name</button>
                    </div>
                  </div>
                )}
              </div>

              {!isGenerated && (
                <div className="p-8 bg-slate-50 flex gap-4">
                  <button onClick={() => setShowModal(false)} className="flex-1 font-bold text-slate-500">Cancel</button>
                  <button 
                    disabled={enteredProxiesCount !== data.totalProfiles}
                    onClick={processAndDownload}
                    className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black disabled:bg-slate-300 transition-all"
                  >
                    Generate & Download
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}