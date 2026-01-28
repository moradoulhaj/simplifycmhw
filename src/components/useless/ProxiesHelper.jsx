import React, { useState } from 'react';
import * as XLSX from 'xlsx';

function ProxiesHelper() {
  const [sessionProfiles, setSessionProfiles] = useState({});
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [manualInput, setManualInput] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const parsedSessions = parseSessions(text);
        setSessionProfiles(parsedSessions);
        const total = Object.values(parsedSessions).reduce((sum, arr) => sum + arr.length, 0);
        setTotalProfiles(total);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a .txt file');
    }
  };

  const parseSessions = (text) => {
    const lines = text
      .split('\n')
      .map((line) => line.trim().replace(/^"+|"+$/g, '')) // Remove quotes
      .filter(Boolean); // Skip empty lines
  
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
  

  const generateExcel = () => {
    const proxies = manualInput.split('\n').map(p => p.trim()).filter(Boolean);
    const sessions = Object.keys(sessionProfiles);
    const profilesBySession = sessionProfiles;
  
    const totalProfilesCount = sessions.reduce(
      (sum, s) => sum + (profilesBySession[s]?.length || 0),
      0
    );
  
    if (proxies.length !== totalProfilesCount) {
      alert(`Number of proxies (${proxies.length}) does not match number of profiles (${totalProfilesCount})`);
      return;
    }
  
    let proxyIndex = 0;
    const sessionData = sessions.map(session => {
      const profiles = profilesBySession[session] || [];
      return profiles.map(profile => `${profile}#${proxies[proxyIndex++]}`);
    });

    
  
    const maxLength = Math.max(...sessionData.map(arr => arr.length));
  
    const rows = [];
    rows.push(sessions);
  
    for (let i = 0; i < maxLength; i++) {
      const row = sessions.map((_, colIndex) => sessionData[colIndex][i] || '');
      rows.push(row);
    }
  
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Session Mapping');
  
    XLSX.writeFile(workbook, 'session_profiles.xlsx');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Proxies Helper</h2>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <label className="cursor-pointer transition-transform hover:scale-105">
            <span className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-block shadow-md">
              Upload File
            </span>
            <input
              type="file"
              accept=".txt"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors"
            disabled={totalProfiles === 0}
          >
            Manual Input
          </button>
        </div>

        {totalProfiles > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 text-blue-800">
            <strong>Total Profiles Detected:</strong> {totalProfiles}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Manual Proxy Input</h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <textarea
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                rows={10}
                className="w-full border border-gray-300 rounded-lg p-3 resize-y mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Paste your proxies here, one per line...\nYou need to provide exactly ${totalProfiles} proxies.`}
              />

              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-600">
                  <span className={`font-medium ${manualInput.split('\n').filter(Boolean).length === totalProfiles ? 'text-green-600' : 'text-red-600'}`}>
                    {manualInput.split('\n').filter(Boolean).length} proxies entered
                  </span>
                  <span> / {totalProfiles} required</span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={generateExcel}
                  disabled={manualInput.split('\n').filter(Boolean).length !== totalProfiles}
                  className={`px-4 py-2 rounded-lg text-white transition-colors ${manualInput.split('\n').filter(Boolean).length === totalProfiles ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-400 cursor-not-allowed'}`}
                >
                  Generate Excel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProxiesHelper;