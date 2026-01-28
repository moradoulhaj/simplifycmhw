//Function to shuffle Tags
export function shuffleTagsInSessions(data) {
  return data.map((session) => {
    // Copy the session array to avoid mutating the original
    const shuffled = [...session];

    // Fisher-Yates shuffle inside the session
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  });
}

export const calcSessions = (firstLine) => {
  // Split the first line by tab to detect the number of sessions

  const sessions = firstLine.split("\t");
  return sessions.length / 2; // return the number of sessions
};

export const parseNumberTagPairs = (line) => {
  // Split the input by tabs to capture numbers, tags, and empty fields
  const elements = line.split("\t");
  // Initialize an empty result array to store pairs
  const result = [];

  // Iterate over elements two at a time
  for (let i = 0; i < elements.length; i += 2) {
    // Get the current number and tag, or use empty strings if missing
    const number = elements[i] || "";
    const tag = elements[i + 1] || "";
    result.push([number, tag]);
  }

  return result;
};
// CMH7 mobile to remove duplicates folders
export function reassignUniqueFoldersToFirstTags(dropData) {
  const uniqueFolders = [
    ...new Set(dropData.map(([folder]) => folder).filter(Boolean)),
  ];
  const result = [];

  let folderIndex = 0;
  for (let i = 0; i < dropData.length; i++) {
    const [, tag] = dropData[i];

    if (folderIndex < uniqueFolders.length) {
      result.push([uniqueFolders[folderIndex], tag]);
      folderIndex++;
    } else {
      result.push(["", tag]);
    }
  }

  return result;
}

// to split tags by sesions
export const collectData = (lines, sessionsNumber) => {
  // Initialize the grouped structure with empty subarrays for each position
  if (sessionsNumber === 0 || !Number.isInteger(sessionsNumber)) {
    toast.error("Make sure ur tags are correct then re-check again.");
    return "wrongIinput";
  }
  const groupedProfilesAndTags = Array.from(
    { length: sessionsNumber },
    () => []
  );

  // Track whether we've encountered an empty pair for each column
  const stopPush = Array(sessionsNumber).fill(false);

  // Populate the grouped structure by column
  lines.forEach((pairs) => {
    pairs.forEach((pair, index) => {
      // Only push if we haven't encountered an empty pair in this column
      if (!stopPush[index]) {
        if (pair[0] === "" && pair[1] === "") {
          stopPush[index] = true; // Mark this column to stop pushing further
        } else {
          groupedProfilesAndTags[index].push(pair);
        }
      }
    });
  });

  return groupedProfilesAndTags;
};

// Function to split each session's pairs into chunks based on dropNumbers
export const splitSessionsByDrops = (
  collectedData,
  dropNumbers,
  usingFixedQuantity,
  Quantity
) => {
  if (!usingFixedQuantity) {
    return collectedData.map((session) => {
      const chunks = Array.from({ length: dropNumbers }, () => []); // Create empty arrays for each drop
      const seedsPerDropForSession = Math.floor(session.length / dropNumbers);
      let remainder = session.length % dropNumbers; // Calculate the remaining seeds
      let start = 0;

      for (let i = 0; i < dropNumbers; i++) {
        let extraSeed = remainder > 0 ? 1 : 0; // Distribute remainder
        let end = start + seedsPerDropForSession + extraSeed;
        chunks[i] = session.slice(start, end);
        start = end;
        remainder--;
      }

      return chunks;
    });
  }

  // Total seeds across all sessions
  const totalSeeds = collectedData.reduce(
    (acc, session) => acc + session.length,
    0
  );
  return collectedData.map((session, sessionIndex) => {
    const sessionProportion = Math.round(
      (session.length / totalSeeds) * Quantity
    );
    let remainder = session.length % dropNumbers; // Calculate the remaining seeds
    console.log(session.length);

    console.log((session.length / totalSeeds) * Quantity);
    console.log("remainder", remainder);

    const chunks = [];
    let start = 0;

    for (let i = 0; i < dropNumbers - 1; i++) {
      let end = start + sessionProportion;
      chunks.push(session.slice(start, end));
      start = end;
    }

    // Push remaining seeds to the last drop
    chunks.push(session.slice(start));
    return chunks;
  });
};

// // function to calcumate propportion
// export const calcProportion = (collectedData, totalMorningSeeds) => {
//   const totalSeeds = collectedData.reduce(
//     (acc, session) => acc + session.length,
//     0
//   );

//   return collectedData.map((session) =>
//     Math.round((session.length / totalSeeds) * totalMorningSeeds)
//   );
// };
export const splitProportionedAndRemainder = (collectedData, Quantity) => {
  const totalSeeds = collectedData.reduce(
    (acc, session) => acc + session.length,
    0
  );

  let remainingQuantity = Quantity;

  const proportioned = [];
  const remainder = [];

  for (let i = 0; i < collectedData.length; i++) {
    const session = collectedData[i];
    let sessionProportion = Math.round(
      (session.length / totalSeeds) * Quantity
    );
    // Last session takes the rest to fix rounding issues
    if (i === collectedData.length - 1) {
      sessionProportion = remainingQuantity;
    }

    remainingQuantity -= sessionProportion;

    // Split session
    const extracted = session.slice(0, sessionProportion);
    const leftOver = session.slice(sessionProportion);

    proportioned.push(extracted);
    remainder.push(leftOver);
  }

  return {
    proportioned,
    remainder,
  };
};

// Function to generate Excel file from session data
import * as XLSX from "xlsx";

export const generateExceel = (seedsBySessionPerDrop) => {
  const worksheetData = [];

  // Prepare headers for each session
  const headerRow = ["Drop"]; // First column for drop labels
  seedsBySessionPerDrop.forEach((_, sessionIndex) => {
    headerRow.push(`Session ${sessionIndex + 1}`, ""); // One column for profile, one for tag
  });
  worksheetData.push(headerRow);

  // To track merge ranges
  const merges = [];

  // Loop through drops and sessions to structure data
  let currentRow = 1; // Start after header row
  const maxDrops = Math.max(
    ...seedsBySessionPerDrop.map((session) => session.length)
  );

  for (let dropIndex = 0; dropIndex < maxDrops; dropIndex++) {
    let maxPairsInDrop = Math.max(
      ...seedsBySessionPerDrop.map((session) => session[dropIndex]?.length || 0)
    );

    if (maxPairsInDrop > 0) {
      // Merge Drop label cell
      merges.push({
        s: { r: currentRow, c: 0 }, // Start cell (row, column)
        e: { r: currentRow + maxPairsInDrop - 1, c: 0 }, // End cell (row, column)
      });

      // Add data for each pair within the drop
      for (let pairIndex = 0; pairIndex < maxPairsInDrop; pairIndex++) {
        const row = [pairIndex === 0 ? dropIndex + 1 : ""]; // Drop label only on the first row of the drop
        seedsBySessionPerDrop.forEach((session) => {
          const pair = session[dropIndex]?.[pairIndex];
          row.push(pair ? `${pair[0]}` : null, pair ? `${pair[1]}` : null); // Add profile and tag for the session
        });
        worksheetData.push(row);
        currentRow++;
      }

      // Add an empty row between drops for visual spacing
      // Add a blank row for visual separation
      worksheetData.push([]);

      currentRow++;
    }
  }

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  worksheet["!merges"] = merges; // Apply merge settings

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sessions");

  XLSX.writeFile(workbook, "sessions_data.xlsx");
};

import JSZip from "jszip";
import { toast } from "react-toastify";
import { processData } from "./ramadanTask";

export const downloadZip = async (
  seedsBySessionPerDrop,
  delimiter,
  selectedEntityName,
  dropTimes,
  sessions,
  fastKill,
  loginNextDay,
  nextDaySeeds,
  timeType,
  scheduleTasks,
  coversationOff
) => {
  if (delimiter === "\\n") {
    delimiter = "\n";
  } else if (delimiter === ";") {
    delimiter = ";";
  }
  // ✅ Logic for Next Day
  if (loginNextDay) {
    const firstLine = nextDaySeeds.split("\n")[0];
    const sessionsNumber = calcSessions(firstLine) - 0.5;

    if (sessionsNumber === 0) {
      toast.error("Plese check Next day Seeds format and re-check");
      return;
    } else if (seedsBySessionPerDrop.length !== sessionsNumber) {
      toast.error("Number of sessions in Current day and Next one mismatch");
      return;
    }

    var { nextDay, onlyTags } = processData(nextDaySeeds);
    const lines = onlyTags.split("\n").map((line) => parseNumberTagPairs(line));
    var collectedData = await collectData(lines, sessionsNumber);
    if (collectedData === "wrongInput") {
      return;
    }
  }

  const zip = new JSZip();
  const combinedDrops = [];

  // ✅ Iterate over sessions and drops to populate combinedDrops
  seedsBySessionPerDrop.forEach((sessionDrops, sessionIndex) => {
    const session = sessions[sessionIndex];
    sessionDrops.forEach((drop, dropIndex) => {
      if (!combinedDrops[dropIndex]) {
        combinedDrops[dropIndex] = [];
      }
      const dropTags = drop.map(([_, tag]) => tag);
      combinedDrops[dropIndex].push(...dropTags);
    });

    // ✅ Store Excel files inside the "Excels" folder
    generateSchedule(
      sessionDrops,
      dropTimes,
      session.username,
      session.config,
      session.script,
      fastKill,
      loginNextDay,
      loginNextDay ? collectedData[sessionIndex] : [],
      timeType,
      scheduleTasks,
      coversationOff
    )
      .then((excelBlob) => {
        zip.file(`Excels/${session.index}.${session.name}.xlsx`, excelBlob);
      })
      .catch((error) =>
        console.error(
          "Error generating Excel for session:",
          session.name,
          error
        )
      );
  });

  // ✅ Add text files for each drop
  combinedDrops.forEach((tags, dropIndex) => {
    const fileName = `${selectedEntityName.split("-")[0]}_file_${
      dropIndex + 1
    }.txt`;
    const fileContent = tags.join(delimiter);
    zip.file(fileName, fileContent);
  });

  // ✅ Generate and add a text log file for drop summary
  const dropLogTxt = generateDropLogTxt(seedsBySessionPerDrop);
  zip.file(`Excels/Drop_Seed_Log.txt`, dropLogTxt);

  // ✅ Add raw array dump like in console.log
  const rawArrayTxt = JSON.stringify(seedsBySessionPerDrop, null, 2); // pretty-printed JSON
  zip.file("Excels/seedsBySessionPerDrop.txt", rawArrayTxt);

  const { excelBlob, worksheetData } = generateExcelBlobWithCSVData(
    seedsBySessionPerDrop , sessions
  );

  // Add Excel file
  zip.file(`Excels/${selectedEntityName}.xlsx`, excelBlob);

  // Convert worksheetData to custom CSV format
  const csvString = worksheetData
    .map((row) =>
      row.map((cell) => (cell != null ? String(cell) : "")).join(";")
    )
    .join("--");

  const csvBlob = new Blob([csvString], { type: "text/csv;charset=utf-8" });

  // Add CSV file
  zip.file(`Excels/${selectedEntityName}_CSV.csv`, csvBlob);

  // ✅ Generate the zip file
  setTimeout(async () => {
    const zipBlob = await zip.generateAsync({ type: "blob" });
    let today = new Date();
    let formattedDate = `${String(today.getDate()).padStart(2, "0")}/${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getHours()).padStart(2, "0")}-${String(
      today.getMinutes()
    ).padStart(2, "0")}`;

    if (loginNextDay) {
      formattedDate += `-WithLogin${nextDay}`;
    }

    // Download the zip file
    saveAs(zipBlob, `${selectedEntityName}-${formattedDate}.zip`);
  }, 1000); // Small delay to ensure Excel files are added
};

// Helper function to generate a drop log in text format
const generateDropLogTxt = (seedsBySessionPerDrop) => {
  const dropCount = seedsBySessionPerDrop[0]?.length || 0;
  let log = "";

  // Iterate over each drop
  for (let dropIndex = 0; dropIndex < dropCount; dropIndex++) {
    log += `Drop ${dropIndex + 1}\n-----------------\n`;
    let total = 0;

    // Iterate over each session
    seedsBySessionPerDrop.forEach((session, sessionIndex) => {
      const drop = session[dropIndex] || [];
      const count = drop.length;
      total += count;
      log += `Session ${sessionIndex + 1}: ${count} seed${
        count !== 1 ? "s" : ""
      }\n`;
    });

    log += `Total: ${total} seed${total !== 1 ? "s" : ""}\n\n`;
  }

  return log;
};

export const generateExcel = (seedsBySessionPerDrop, entityName) => {
  const excelBlob = generateExcelBlob(seedsBySessionPerDrop);
  saveAs(excelBlob, `CMH${entityName}.xlsx`);
};
export const generateExcelBlob = (seedsBySessionPerDrop) => {
  const worksheetData = [];
  const profileSheetData = [];
  const headerRow = ["Drop"];

  // Prepare headers for each session
  seedsBySessionPerDrop.forEach((_, sessionIndex) => {
    headerRow.push(`Session ${sessionIndex + 1}`, "");
  });
  worksheetData.push(headerRow);

  // Track merges
  const merges = [];
  let currentRow = 1;
  const maxDrops = Math.max(
    ...seedsBySessionPerDrop.map((session) => session.length)
  );

  for (let dropIndex = 0; dropIndex < maxDrops; dropIndex++) {
    let maxPairsInDrop = Math.max(
      ...seedsBySessionPerDrop.map((session) => session[dropIndex]?.length || 0)
    );

    if (maxPairsInDrop > 0) {
      merges.push({
        s: { r: currentRow, c: 0 },
        e: { r: currentRow + maxPairsInDrop - 1, c: 0 },
      });

      for (let pairIndex = 0; pairIndex < maxPairsInDrop; pairIndex++) {
        const row = [pairIndex === 0 ? dropIndex + 1 : ""];
        seedsBySessionPerDrop.forEach((session) => {
          const pair = session[dropIndex]?.[pairIndex];
          row.push(pair ? `${pair[0]}` : null, pair ? `${pair[1]}` : null);
        });
        worksheetData.push(row);
        currentRow++;
      }

      worksheetData.push([]);
      currentRow++;
    }

    // Create row for Profiles sheet
    const profileRow = [dropIndex + 1];
    seedsBySessionPerDrop.forEach((session) => {
      const profiles =
        session[dropIndex]?.map((pair) => pair[0]).join("|") || "";
      profileRow.push(profiles);
    });
    profileSheetData.push(profileRow);
  }

  const profileSheetHeader = ["Drop"];
  seedsBySessionPerDrop.forEach((_, sessionIndex) =>
    profileSheetHeader.push(`Session ${sessionIndex + 1}`)
  );
  profileSheetData.unshift(profileSheetHeader);

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  worksheet["!merges"] = merges;
  const profileSheet = XLSX.utils.aoa_to_sheet(profileSheetData);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sessions");
  XLSX.utils.book_append_sheet(workbook, profileSheet, "Profiles by Drop");

  // Convert to Blob for downloading or adding to ZIP
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  return new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};
export const generateExcelBlobWithCSVData = (seedsBySessionPerDrop , sessions ) => {
  const worksheetData = [];
  const profileSheetData = [];
  const headerRow = ["Drop"];

  seedsBySessionPerDrop.forEach((_, sessionIndex) => {
    headerRow.push(sessions[sessionIndex].name, "");
  });
  worksheetData.push(headerRow);

  const merges = [];
  let currentRow = 1;
  const maxDrops = Math.max(
    ...seedsBySessionPerDrop.map((session) => session.length)
  );

  for (let dropIndex = 0; dropIndex < maxDrops; dropIndex++) {
    let maxPairsInDrop = Math.max(
      ...seedsBySessionPerDrop.map((session) => session[dropIndex]?.length || 0)
    );

    if (maxPairsInDrop > 0) {
      merges.push({
        s: { r: currentRow, c: 0 },
        e: { r: currentRow + maxPairsInDrop - 1, c: 0 },
      });

      for (let pairIndex = 0; pairIndex < maxPairsInDrop; pairIndex++) {
        const row = [pairIndex === 0 ? dropIndex + 1 : ""];
        seedsBySessionPerDrop.forEach((session) => {
          const pair = session[dropIndex]?.[pairIndex];
          row.push(pair ? `${pair[0]}` : "", pair ? `${pair[1]}` : "");
        });
        worksheetData.push(row);
        currentRow++;
      }

      worksheetData.push([]);
      currentRow++;
    }

    const profileRow = [dropIndex + 1];
    seedsBySessionPerDrop.forEach((session) => {
      const profiles =
        session[dropIndex]?.map((pair) => pair[0]).join("|") || "";
      profileRow.push(profiles);
    });
    profileSheetData.push(profileRow);
  }

  const profileSheetHeader = ["Drop"];
  seedsBySessionPerDrop.forEach((_, sessionIndex) =>
    profileSheetHeader.push(`Session ${sessionIndex + 1}`)
  );
  profileSheetData.unshift(profileSheetHeader);

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  worksheet["!merges"] = merges;
  const profileSheet = XLSX.utils.aoa_to_sheet(profileSheetData);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sessions");
  XLSX.utils.book_append_sheet(workbook, profileSheet, "Profiles by Drop");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const excelBlob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  return { excelBlob, worksheetData };
};

export const generateSchedule = async (
  profilesByDrop,
  dropTimes,
  sessionName,
  configName,
  scriptName,
  fastKill,
  loginNextDay,
  nextDaySeeds,
  timeType,
  scheduleTasks,
  coversationOff
) => {
  try {
    const response = await fetch("/CMHW-TOOLS/template.xlsx");
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    const today = new Date();
    let rowIndex = 2;
    let lastDropDate = new Date(today);
    let allProfiles = [];

    // ✅ Drop tasks

    profilesByDrop.forEach((profileGroup, index) => {
      if (profileGroup.length === 0) return;
      const dropProfiles = profileGroup.map((p) => p[0]);
      allProfiles.push(...dropProfiles);

      let [hours, minutes] = dropTimes[index].split(":").map(Number);
      if (hours >= 0 && hours <= 9) lastDropDate.setDate(today.getDate() + 1);
      lastDropDate.setHours(hours, minutes + 5, 0);

      let formattedDate = lastDropDate
        .toLocaleDateString("en-GB")
        .split("/")
        .join("/");
      let formattedTime = lastDropDate.toTimeString().split(" ")[0];
      let scheduledTime = `${formattedDate} ${formattedTime}`;

      // ✅ Add 55 minutes for end time
      let endDate = new Date(lastDropDate.getTime());
      endDate.setMinutes(endDate.getMinutes() + 55);
      let endFormattedDate = endDate
        .toLocaleDateString("en-GB")
        .split("/")
        .join("/");
      let endFormattedTime = endDate.toTimeString().split(" ")[0];
      let endScheduledTime = `${endFormattedDate} ${endFormattedTime}`;
      if (scheduleTasks) {
        worksheet[`A${rowIndex}`] = { v: index + 1 };
        worksheet[`B${rowIndex}`] = { v: sessionName };
        worksheet[`C${rowIndex}`] = { v: scriptName };
        worksheet[`D${rowIndex}`] = { v: dropProfiles.join("|") };
        worksheet[`E${rowIndex}`] = { v: scheduledTime };
        worksheet[`F${rowIndex}`] = { v: endScheduledTime };
        worksheet[`G${rowIndex}`] = { v: configName };
        worksheet[`H${rowIndex}`] = { v: timeType };
        worksheet[`I${rowIndex}`] = { v: `Drop ${index + 1}` };

        rowIndex++;
      }
    });

    // ✅ FAST_SPAM_KILL_EMPTY
    if (fastKill && allProfiles.length > 0) {
      lastDropDate.setMinutes(lastDropDate.getMinutes() + 55); // Start after last drop ends
      let fastKillStartDate = new Date(lastDropDate.getTime());

      let fastKillEndDate = new Date(fastKillStartDate.getTime());
      fastKillEndDate.setMinutes(fastKillEndDate.getMinutes() + 55); // ✅ Add 55min

      let fastKillDate = fastKillStartDate
        .toLocaleDateString("en-GB")
        .split("/")
        .join("/");
      let fastKillTime = fastKillStartDate.toTimeString().split(" ")[0];
      let fastKillScheduledTime = `${fastKillDate} ${fastKillTime}`;

      let fastKillEndDateStr = fastKillEndDate
        .toLocaleDateString("en-GB")
        .split("/")
        .join("/");
      let fastKillEndTimeStr = fastKillEndDate.toTimeString().split(" ")[0];
      let fastKillScheduledEndTime = `${fastKillEndDateStr} ${fastKillEndTimeStr}`;

      worksheet[`A${rowIndex}`] = { v: rowIndex - 1 };
      worksheet[`B${rowIndex}`] = { v: sessionName };
      worksheet[`C${rowIndex}`] = { v: "FAST_SPAM_KILL_EMPTY.js" };
      worksheet[`D${rowIndex}`] = { v: allProfiles.join("|") };
      worksheet[`E${rowIndex}`] = { v: fastKillScheduledTime };
      worksheet[`F${rowIndex}`] = { v: fastKillScheduledEndTime };
      worksheet[`G${rowIndex}`] = { v: "FAST_SPAM_KILL_EMPTY" };
      worksheet[`H${rowIndex}`] = { v: timeType };
      worksheet[`I${rowIndex}`] = { v: "FAST_SPAM_KILL" };

      rowIndex++;
    }
    // ✅ NEXT_DAY_LOGIN

    if (loginNextDay) {
      let nextDay = new Date(today);
      nextDay.setDate(today.getDate() + 1);
      nextDay.setHours(9, 0, 0); // 09:00:00

      let loginStartDate = new Date(nextDay);
      let loginEndDate = new Date(loginStartDate.getTime());
      loginEndDate.setMinutes(loginEndDate.getMinutes() + 55); // ✅ Add 55 min

      let loginStartFormatted = `${loginStartDate
        .toLocaleDateString("en-GB")
        .split("/")
        .join("/")} ${loginStartDate.toTimeString().split(" ")[0]}`;
      let loginEndFormatted = `${loginEndDate
        .toLocaleDateString("en-GB")
        .split("/")
        .join("/")} ${loginEndDate.toTimeString().split(" ")[0]}`;

      const nextDayProfiles = nextDaySeeds.map((p) => p[0]);

      worksheet[`A${rowIndex}`] = { v: rowIndex - 1 };
      worksheet[`B${rowIndex}`] = { v: sessionName };
      worksheet[`C${rowIndex}`] = { v: "Login_Gmail.js" };
      worksheet[`D${rowIndex}`] = { v: nextDayProfiles.join("|") };
      worksheet[`E${rowIndex}`] = { v: loginStartFormatted };
      worksheet[`F${rowIndex}`] = { v: loginEndFormatted };
      worksheet[`G${rowIndex}`] = { v: "check_status" };
      worksheet[`H${rowIndex}`] = { v: timeType };
      worksheet[`I${rowIndex}`] = { v: "NEXT_DAY_LOGIN" };

      rowIndex++;
    }
    // ✅ Deactivate Convversation task

    if (coversationOff) {
      let nextDay = new Date(today);
      nextDay.setDate(today.getDate() + 1);
      nextDay.setHours(9, 0, 0); // 09:00:00

      let loginStartDate = new Date(nextDay);
      let loginEndDate = new Date(loginStartDate.getTime());
      loginEndDate.setMinutes(loginEndDate.getMinutes() + 55); // ✅ Add 55 min

      let loginStartFormatted = `${loginStartDate
        .toLocaleDateString("en-GB")
        .split("/")
        .join("/")} ${loginStartDate.toTimeString().split(" ")[0]}`;
      let loginEndFormatted = `${loginEndDate
        .toLocaleDateString("en-GB")
        .split("/")
        .join("/")} ${loginEndDate.toTimeString().split(" ")[0]}`;

      const nextDayProfiles = nextDaySeeds.map((p) => p[0]);

      worksheet[`A${rowIndex}`] = { v: rowIndex - 1 };
      worksheet[`B${rowIndex}`] = { v: sessionName };
      worksheet[`C${rowIndex}`] = { v: "Login_Gmail.js" };
      worksheet[`D${rowIndex}`] = { v: nextDayProfiles.join("|") };
      worksheet[`E${rowIndex}`] = { v: loginStartFormatted };
      worksheet[`F${rowIndex}`] = { v: loginEndFormatted };
      worksheet[`G${rowIndex}`] = { v: "check_status" };
      worksheet[`H${rowIndex}`] = { v: timeType };
      worksheet[`I${rowIndex}`] = { v: "Deactivate Conversation" };

      rowIndex++;
    }

    // ⬇️ Return Excel blob
    const excelBlob = new Blob(
      [XLSX.write(workbook, { type: "array", bookType: "xlsx" })],
      {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    );

    return excelBlob;
  } catch (error) {
    console.error("Error updating Excel template:", error);
  }
};
