import React, { useState } from 'react';
import TextAreaWithCopy from '../smalls/logCheckerSmalls/TextAreaWithCopy';
import TextAreaWithCopyDesktop from './Small Components/TextAreaWithCopyDesktop';
import { ToastContainer, toast } from 'react-toastify';

export default function LogAnalyseV2() {
  const [logs, setLogs] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [results, setResults] = useState({
    recheck: '',
    notConnected: '',
    connected: '',
    syntaxPrblm: '',
    others: '',
  });

  const processLogs = () => {
    const logLines = logs.trim().split('\n');
    const recheck = [];
    const notConnected = [];
    const connected = [];
    const syntaxPrblm = [];
    const others = [];
  
    const titleMap = {};  // index -> array of titles
    const lastTitleMap = {};  // index -> latest title
    const emails = {};  // index -> latest email
  
    for (let line of logLines) {
      const parts = line.trim().split(',');
  
      if (parts.length < 3) {
        syntaxPrblm.push(line);
        continue;
      }
  
      const index = parseInt(parts[1]);
      if (isNaN(index)) {
        syntaxPrblm.push(line);
        continue;
      }
  
      const title = parts.slice(2, parts.length - 1).join(',').trim();
      const email = parts[2];
  
      if (!titleMap[index]) titleMap[index] = [];
      titleMap[index].push(title);
  
      lastTitleMap[index] = title;  // store latest title
      emails[index] = email;
    }
  
    const fromId = parseInt(from);
    const toId = parseInt(to);
  
    for (let i = fromId; i <= toId; i++) {
      const titles = titleMap[i];
  
      if (!titles || titles.length === 0) {
        recheck.push(`${i},not exist`);
        continue;
      }
  
      const uniqueStatuses = new Set(titles.map(getStatusFromTitle));
      const lastTitle = lastTitleMap[i];
      const lastStatus = getStatusFromTitle(lastTitle);
  
      if (uniqueStatuses.size === 1) {
        // all same status → push using any (use last)
        pushToCategory(i, lastTitle, lastStatus);
      } else {
        // different statuses → use latest title only
        pushToCategory(i, lastTitle, lastStatus);
      }
    }
  
    if (syntaxPrblm.length > 0) {
      toast.warn(`${syntaxPrblm.length} malformed entries skipped.`);
    }
  
    setResults({
      recheck: recheck.join('\n'),
      notConnected: notConnected.join('\n'),
      connected: connected.join('\n'),
      syntaxPrblm: syntaxPrblm.join('\n'),
      others: others.join('\n'),
    });
  
    // Helper: classify title into a status string
    function getStatusFromTitle(title) {
      if (title === 'Gmail' ) return 'recheck';
      if (title.includes('Gmail') && !title.includes(':') && !title.includes('@')) return 'recheck';

      if (title === 'Problem loading page' || title.includes('Temporary Error') || title.includes('Problem loading page')) {
        return 'recheck';
      }
      if (title === 'Temporary Error') return 'recheck';
      if (title.includes('|') && !title.includes('@')) return 'notConnected';
      if (title.includes('@gmail.com') || title.includes('@googlemail.com')) return 'connected';
      return 'others';
    }
  
    // Helper: push into the appropriate result array
    function pushToCategory(index, title, status) {
      switch (status) {
        case 'recheck':
          recheck.push(`${index},${title}`);
          break;
        case 'notConnected':
          notConnected.push(`${index},${title}`);
          break;
        case 'connected':
          connected.push(`${index},${title}`);
          break;
        case 'others':
        default:
          others.push(`${index},${title}`);
          break;
      }
    }
  };
  

  const renderResultTextAreas = () => {
    const categories = [
      { id: 'recheck', label: 'Recheck', data: results.recheck, color: 'bg-yellow-50 border-yellow-200' },
      { id: 'not_connected', label: 'Not Connected', data: results.notConnected, color: 'bg-red-50 border-red-200' },
      { id: 'connected', label: 'Connected', data: results.connected, color: 'bg-green-50 border-green-200' },
      { id: 'others', label: 'Others', data: results.others, color: 'bg-gray-50 border-gray-200' },
      { id: 'syntaxPrblm', label: 'Syntax Problems', data: results.syntaxPrblm, color: 'bg-orange-50 border-orange-200' },
    ];

    return categories.map(({ id, label, data, color }) => {
      if (!data?.length) return null;
      return (
        <div key={id} className={`p-4 rounded-lg border ${color} shadow-sm`}>
          <TextAreaWithCopyDesktop id={id} label={label} value={data} />
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">Log Analyzer</h2>

        {/* Input Section */}
        <div className="mb-8">
          <label className="block text-lg font-medium text-gray-700 mb-3">Paste Logs:</label>
          <textarea
            rows="10"
            className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
            value={logs}
            onChange={(e) => setLogs(e.target.value)}
            placeholder="Paste your log content here..."
          />
        </div>

        {/* Range Inputs */}
        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          <div className="flex-1">
            <label className="block text-lg font-medium text-gray-700 mb-2">From:</label>
            <input
              type="number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="Start ID"
            />
          </div>

          <div className="flex-1">
            <label className="block text-lg font-medium text-gray-700 mb-2">To:</label>
            <input
              type="number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="End ID"
            />
          </div>
        </div>

        {/* Process Button */}
        <button
          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 active:scale-95 mb-10"
          onClick={processLogs}
        >
          Analyze Logs
        </button>

        {/* Results Section */}
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Analysis Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderResultTextAreas()}
          </div>
        </div>

        <ToastContainer 
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </div>
    </div>
  );
}
