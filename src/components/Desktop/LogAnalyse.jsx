import React, { useState } from 'react';
import TextAreaWithCopy from '../smalls/logCheckerSmalls/TextAreaWithCopy';
import TextAreaWithCopyDesktop from './Small Components/TextAreaWithCopyDesktop';
import { ToastContainer } from 'react-toastify';

export default function LogAnalyse() {
  // State variables to store log input, range values, and processed results
  const [logs, setLogs] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [results, setResults] = useState({ recheck: '', notConnected: '', connected: '' });

  // Function to process log data
  const processLogs = () => {
    // Split the input log text by newline
    const logLines = logs.trim().split('\n');

    // Prepare containers for result categories
    const recheck = [];
    const notConnected = [];
    const connected = [];

    // Temporary objects to hold parsed entries by index
    const entries = {};
    const emails = {};

    // Parse each log line
    for (let line of logLines) {
      const parts = line.trim().split(',');
      // Ensure line has enough parts to parse
    //  if (parts.length < 6) continue;

      const index = parseInt(parts[1]); // second item is the index
      const email = parts[2];           // third item is the email
      const title = parts[4];           // fifth item is the title/page status

      // Store parsed data if index is valid
      if (!isNaN(index)) {
        entries[index] = title;
        emails[index] = email;
      }
    }

    // Convert input range values to numbers
    const fromId = parseInt(from);
    const toId = parseInt(to);

    // Loop through the range of indices
    for (let i = fromId; i <= toId; i++) {

      const title = entries[i] || '';
      const email = emails[i] || '';
      // Categorize based on title and presence of data
      console.log(title)
      if (!(i in entries)) {
        recheck.push(`${i},not exist`);
      } else if (title === 'Gmail') {
        recheck.push(`${i},Gmail`);
      } else if (title === 'Problem loading page') {
        recheck.push(`${i},Problem loading page`);
      } else if (title === 'Temporary Error') {
        recheck.push(`${i},Temporary Error`);
      } else if (title.startsWith('Gmail: Private and secure')) {
        notConnected.push(`${i},${title}`);
      } else if (email) {
        connected.push(`${i},${email}`);
      }
    }

    // Update result state to display in the UI
    setResults({
      recheck: recheck.join('\n'),
      notConnected: notConnected.join('\n'),
      connected: connected.join('\n'),
    });
  };

    // Render each category textarea only if it has content
    const renderResultTextAreas = () => {
        const categories = [
          { id: 'recheck', label: 'Recheck', data: results.recheck },
          { id: 'not_connected', label: 'Not Connected', data: results.notConnected },
          { id: 'connected', label: 'Connected', data: results.connected }
        ]
    
        return categories.map(({ id, label, data }) => {
          if (!data?.length) return null
          return (
            <TextAreaWithCopyDesktop key={id} id={id} label={label} value={data} />
          )
        })
      }
      
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Log Analyse</h2>

      {/* Textarea for log input */}
      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-700">Paste Logs:</label>
        <textarea
          rows="10"
          className="w-full p-3 border rounded-md shadow-sm resize-none"
          value={logs}
          onChange={(e) => setLogs(e.target.value)}
          placeholder="Paste your log content here..."
        />
      </div>

      {/* Inputs for range (from - to) */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label className="block mb-1 font-medium text-gray-700">From:</label>
          <input
            type="number"
            className="w-full p-2 border rounded-md"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="Start ID"
          />
        </div>

        <div className="flex-1">
          <label className="block mb-1 font-medium text-gray-700">To:</label>
          <input
            type="number"
            className="w-full p-2 border rounded-md"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="End ID"
            
          />
        </div>
      </div>

      {/* Button to trigger processing */}
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-6"
        onClick={processLogs}
      >
        Process Logs
      </button>

      {/* Display output in categorized text areas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderResultTextAreas()}
      </div>
      <ToastContainer/>
    </div>
  );
}
