export const checkLogs = (profiles, logs) => {
  const profilesArr = profiles.split("\n");
  const logsArr = logs.split("\n");

  let notLogsProfiles = [];
  let connectedProfiles = [];
  let proxyDownProfiles = [];
  let maxExecutionTimeProfiles = [];
  let accountRestrictedProfiles = [];
  let captchaVerificationProfiles = [];
  let wrongPasswordProfiles = [];
  let phoneNumberProfiles = [];
  let unusualActivityProfiles = [];
  let accountDisabledProfiles = [];
  let othersProfiles = [];
  let othersLogs = [];

  let wrongBrowserProfiles = [];
  let wrongRecoveryProfiles = [];
  let disconnectedProfiles = [];

  logsArr.forEach((log, i) => {
    log = log.toLowerCase();

    if (log === "") {
      notLogsProfiles.push(profilesArr[i]);
    } else if (log === "matched" || log.includes("active")) {
      connectedProfiles.push(profilesArr[i]);
    } else if (log.includes("proxy down") || log.includes("proxy problem")) {
      proxyDownProfiles.push(profilesArr[i]);
    } else if (log.includes("account_disabled_check")) {
      accountDisabledProfiles.push(profilesArr[i]);
    } else if (
      log.includes("captcha verification") ||
      log.includes("captcha_verification") ||
      log.includes("captcha_text") ||
      log.includes("device verification")
    ) {
      captchaVerificationProfiles.push(profilesArr[i]);
    } else if (
      log.includes("recovery verification") ||
      log.includes("wrong_recovery") ||
      log.includes("wrong_2fa")
    ) {
      wrongRecoveryProfiles.push(profilesArr[i]);
    } else if (log.includes("confirm phone number")) {
      phoneNumberProfiles.push(profilesArr[i]);
    } else if (log.includes("wrong_password")) {
      wrongPasswordProfiles.push(profilesArr[i]); // Add profile to disconnectedProfiles
    } else if (log.includes("unusual activity")) {
      unusualActivityProfiles.push(profilesArr[i]);
    } else {
      let logArr = log.split("update_status : ");
      log = logArr[logArr.length - 1];
      logArr = log.split(" ; ");
      log = logArr[logArr.length - 1];

      switch (log) {
        case "connected":
        case "active":
        case "matched":
        case "critical alert":
          // case "spam deleted":
          connectedProfiles.push(profilesArr[i]);
          break;
        case "max_execution_time":
          maxExecutionTimeProfiles.push(profilesArr[i]);
          break;
        case "account_restricted":
          accountRestrictedProfiles.push(profilesArr[i]);
          break;
        case "captcha_verification":
          captchaVerificationProfiles.push(profilesArr[i]);
          break;
        case "wrong_password":
          wrongPasswordProfiles.push(profilesArr[i]);
          break;
        case "phone_number":
          phoneNumberProfiles.push(profilesArr[i]);
          break;
        case "unusual_activity" || "account_disabled_unusual":
          unusualActivityProfiles.push(profilesArr[i]);
          break;
        case "wrong_browser":
          wrongBrowserProfiles.push(profilesArr[i]);
          break;
        case "account_disabled" || "account_disabled_check":
          accountDisabledProfiles.push(profilesArr[i]);
          break;
        case "wrong_recovery":
          wrongRecoveryProfiles.push(profilesArr[i]);
          break;

        default:
          othersProfiles.push(profilesArr[i]);
          othersLogs.push(log);

          break;
      }
    }
  });

  return {
    notLogsProfiles,
    connectedProfiles,
    proxyDownProfiles,
    maxExecutionTimeProfiles,
    accountRestrictedProfiles,
    captchaVerificationProfiles,
    wrongPasswordProfiles,
    phoneNumberProfiles,
    unusualActivityProfiles,
    accountDisabledProfiles,
    othersProfiles,
    wrongBrowserProfiles,
    wrongRecoveryProfiles,
    disconnectedProfiles,
    othersLogs,
  };
};

// New check logs
export const checkLogsNew = (profiles, logs) => {
  const profilesArr = profiles.split("\n");
  const logsArr = logs.split("\n");

  let notLogsProfiles = [];
  let connectedProfiles = [];
  let proxyDownProfiles = [];
  let maxExecutionTimeProfiles = [];
  let accountRestrictedProfiles = [];
  let captchaVerificationProfiles = [];
  let wrongPasswordProfiles = [];
  let phoneNumberProfiles = [];
  let unusualActivityProfiles = [];
  let accountDisabledProfiles = [];
  let othersProfiles = [];
  let othersLogs = [];

  let wrongBrowserProfiles = [];
  let wrongRecoveryProfiles = [];
  let disconnectedProfiles = [];

  logsArr.forEach((rawLog, i) => {
    const profile = profilesArr[i];
    let primarylog = rawLog.toLowerCase().trim();
    let log = primarylog;

    if (log === "") {
      notLogsProfiles.push(profile);
      return;
    }

    // STEP 1: Get last semicolon part
    const semicolonParts = log.split(";");
    const lastSemicolonPart = semicolonParts[semicolonParts.length - 1].trim();
    if (lastSemicolonPart.includes("by =>") || lastSemicolonPart.includes("proxyloadingtime")) {
      proxyDownProfiles.push(profile);
      return;
    }

    // STEP 2: Check for max_execution_time and look before it
    if (lastSemicolonPart.includes("max_execution_time")) {
      const beforeMax = log.split("max_execution_time")[0];
      if (/\b(connected|active)\b/.test(beforeMax)) {
        connectedProfiles.push(profile);
        return;
      } else {
        maxExecutionTimeProfiles.push(profile);
        return;
      }
    }

    // STEP 3: Clean further
    log = lastSemicolonPart;

    if (log.includes("update_status")) {
      log = log.split("update_status").pop().trim();
    }

    if (log.includes(":")) {
      log = log.split(":").pop().trim();
    }

    // STEP 4: Match status
    switch (log) {
      case "connected":
      case "active":
      case "matched":
      case "critical alert":
        connectedProfiles.push(profile);
        break;
      case "proxy down":
      case "proxy problem":
        proxyDownProfiles.push(profile);
        break;
      case "account_restricted":
        accountRestrictedProfiles.push(profile);
        break;
        
      case "captcha_verificaion":
      case "captcha_verification":
      case "captcha_text":
      case "device verification":
      case "captcha verification":
        captchaVerificationProfiles.push(profile);
        break;
      case "wrong_password":
        case "wrong password":

        wrongPasswordProfiles.push(profile);
        break;
      case "phone_number":
      case "confirm phone number":
        phoneNumberProfiles.push(profile);
        break;
      case "wrong_browser":
      case "wrong browser":
        wrongBrowserProfiles.push(profile);
        break;
      case "profile disconnected":
      case "verifyyou task":
        disconnectedProfiles.push(profile);
        break;
      case "wrong_recovery":
      case "recovery verification":
      case "wrong_2fa":
        wrongRecoveryProfiles.push(profile);
        break;
      case "account_disabled":
      case "account_disabled_check":
        accountDisabledProfiles.push(profile);
        break;
      case "unusual_activity":
      case "account_disabled_unusual":
        unusualActivityProfiles.push(profile);
        break;
      default:
        othersProfiles.push(profile);
        othersLogs.push(primarylog);
        break;
    }
  });

  return {
    notLogsProfiles,
    connectedProfiles,
    proxyDownProfiles,
    maxExecutionTimeProfiles,
    accountRestrictedProfiles,
    captchaVerificationProfiles,
    wrongPasswordProfiles,
    phoneNumberProfiles,
    unusualActivityProfiles,
    accountDisabledProfiles,
    othersProfiles,
    wrongBrowserProfiles,
    wrongRecoveryProfiles,
    disconnectedProfiles,
    othersLogs,
  };
};

export const checkCleanLogs = (profiles, logs) => {
  const profilesArr = profiles.split("\n");
  const logsArr = logs.split("\n");

  let notLogsProfiles = [];
  let spamNotDeleted = [];
  let spamDeleted = [];

  logsArr.forEach((log, i) => {
    log = log.toLowerCase();

    if (log === "") {
      notLogsProfiles.push(profilesArr[i]);
    } else if (log === "spam not deleted") {
      spamNotDeleted.push(profilesArr[i]);
    } else if (log.includes("spam deleted")) {
      spamDeleted.push(profilesArr[i]);
    }
  });

  return {
    notLogsProfiles,
    spamNotDeleted,
    spamDeleted,
  };
};
export const extractColumns234 = (text) => {
  return text
    .split("\n")
    .map((line) => {
      const parts = line.split("\t");
      return [parts[1], parts[2], parts[3]].join("\t");
    })
    .join("\n");
};
