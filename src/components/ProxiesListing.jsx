import React, { useState } from 'react';
import * as XLSX from 'xlsx';

function ProxiesListing() {
  const [text, setText] = useState('');
  const [rawProxies, setRawProxies] = useState([]); // store raw CSV parsed lines

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const textContent = await file.text();
    const lines = textContent.trim().split('\n');
    const headers = lines[0].split(';');
    const dataLines = lines.slice(1);

    const entityIndex = headers.indexOf('entity');
    const ipIndex = headers.indexOf('ip');
    const countryIndex = headers.indexOf('country');

    // Store raw proxies as objects, no filtering here
    const parsed = dataLines.map((line) => {
      const cols = line.split(';');
      return {
        entity: cols[entityIndex]?.trim(),
        ip: cols[ipIndex]?.trim(),
        country: cols[countryIndex]?.trim(),
      };
    }).filter(item => item.entity && item.ip && item.country);

    setRawProxies(parsed);
  };

  const handleGenerate = () => {
    if (!rawProxies.length) {
      alert('Please upload a valid CSV file.');
      return;
    }

    const listedIPs = new Set(
      text
        .split('\n')
        .map((ip) => ip.trim())
        .filter(Boolean)
    );

    // Filter out listed IPs now
    const filteredProxies = rawProxies.filter(p => !listedIPs.has(p.ip));

    // Group proxies by entity and USA/Other
    const groupedProxies = {};
    filteredProxies.forEach(({ entity, ip, country }) => {
      if (!groupedProxies[entity]) groupedProxies[entity] = { USA: [], Other: [] };
      if (country === 'United States') groupedProxies[entity].USA.push(ip);
      else groupedProxies[entity].Other.push(ip);
    });

    const maxLength = Math.max(
      ...Object.values(groupedProxies).map(group => Math.max(group.USA.length, group.Other.length))
    );

    const headerRow1 = [];
    const headerRow2 = [];
    const dataRows = Array.from({ length: maxLength }, () => []);

    Object.entries(groupedProxies).forEach(([entity, group]) => {
      headerRow1.push(entity, '');
      headerRow2.push('PROXY USA', 'PROXY GEO');

      for (let i = 0; i < maxLength; i++) {
        dataRows[i].push(group.USA[i] || '', group.Other[i] || '');
      }
    });

    // Combine main data
    const finalData = [headerRow1, headerRow2, ...dataRows];

    // Add listed proxies in top right corner
    const listedStartCol = headerRow1.length + 2; // gap of 2 columns
    finalData[0][listedStartCol] = 'LISTED PROXIES';
    Array.from(listedIPs).forEach((ip, idx) => {
      if (!finalData[idx + 1]) finalData[idx + 1] = [];
      finalData[idx + 1][listedStartCol] = ip;
    });

    const worksheet = XLSX.utils.aoa_to_sheet(finalData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Proxies');

    XLSX.writeFile(workbook, 'grouped_proxies.xlsx');
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800"> Proxy Organizer</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV File</label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="w-full text-sm text-gray-700 border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Listed Proxies (IPs per line)</label>
        <textarea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="One IP per line"
        />
      </div>

      <button
        onClick={handleGenerate}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition"
      >
         Generate Excel
      </button>
    </div>
  );
}

export default ProxiesListing;
