import { useEffect, useState } from "react";
import TextAreaWithCopy from "./TextAreaWithCopy";
import ProxiesModal from "../ProxiesModal";
import { toast } from "react-toastify";
import LogsModal from "./LogsModal ";

export default function Monitor({ result }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [modalLogs, setModalogs] = useState(false);

  // Combine specific profile arrays
  const combinedProfiles = [
    ...(result?.maxExecutionTimeProfiles || []),
    ...(result?.proxyDownProfiles || []),
    ...(result?.notLogsProfiles || []),
    ...(result?.disconnectedProfiles || []),
    ...(result?.othersProfiles || []),
    ...(result?.wrongBrowserProfiles || []),
  ];

  // Keydown listener for modal toggle
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey || event.shiftKey) {
        if (combinedProfiles.length > 0) {
          setIsModalOpen((prev) => !prev);
        } else {
          toast.error("You have no profiles with proxy down");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [combinedProfiles]);

  // Helper to render TextAreas
  const renderTextAreas = () => {
    const profileCategories = [
      { id: "active", label: "Active", data: result?.connectedProfiles },
      { id: "proxyDown", label: "Proxy Down", data: result?.proxyDownProfiles },
      { id: "spamDeleted", label: "Spam Deleted", data: result?.spamDeleted },

      {
        id: "spamNotDeleted",
        label: "Spam Not Deleted",
        data: result?.spamNotDeleted,
      },

      {
        id: "maxExecutionTime",
        label: "Max Execution Time",
        data: result?.maxExecutionTimeProfiles,
      },
      {
        id: "disconnected",
        label: "Disconnected",
        data: result?.disconnectedProfiles,
      },
      {
        id: "wrongBrowser",
        label: "Wrong Browser",
        data: result?.wrongBrowserProfiles,
      },
      {
        id: "accountRestricted",
        label: "Account Restricted",
        data: result?.accountRestrictedProfiles,
      },
      {
        id: "captchaVerification",
        label: "Captcha Verification",
        data: result?.captchaVerificationProfiles,
      },
      {
        id: "wrongPassword",
        label: "Wrong Password",
        data: result?.wrongPasswordProfiles,
      },
      {
        id: "wrongRecovery",
        label: "Wrong Recovery",
        data: result?.wrongRecoveryProfiles,
      },
      {
        id: "phoneNumber",
        label: "Phone Number",
        data: result?.phoneNumberProfiles,
      },
      {
        id: "usualActivity",
        label: "Unusual Activity",
        data: result?.unusualActivityProfiles,
      },
      {
        id: "accountDisabled",
        label: "Account Disabled",
        data: result?.accountDisabledProfiles,
      },
      { id: "empty", label: "Empty", data: result?.notLogsProfiles },
      { id: "others", label: "Others", data: result?.othersProfiles },
    ];
    return profileCategories.map(({ id, label, data }) => {
      if (!data?.length) return null; // Skip empty categories
      // If it's "others", display the logs instead
      if (id === "others") {
        return (
          <TextAreaWithCopy
            key={id}
            id={id}
            label={label}
            value={data.join("\n")}
            setModalogs={setModalogs}
            logs={result?.othersLogs}
          />
        );
      }
      return (
        <TextAreaWithCopy
          key={id}
          id={id}
          label={label}
          value={data.join("\n")}
        />
      );
    });
  };

  return (
    <div className="p-8 mx-auto flex flex-col justify-center items-center bg-white rounded-lg shadow-lg">
      <div className="w-4/5 flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Results Overview</h3>
        <div
          className="relative"
          onMouseEnter={() => setShowNotification(true)}
          onMouseLeave={() => setShowNotification(false)}
        >
          <button
            className="hover:bg-gray-50 text-black p-2 bg-transparent rounded-md transition-all duration-200"
            title="Open the proxies settings modal - Alt Or Shift"
            aria-label="Copy profiles"
            onClick={() => setIsModalOpen(true)}
          >
            <i className="ri-settings-5-line text-xl"></i>
          </button>
          {/* Hover Notification */}
          {showNotification && (
            <div className="absolute top-9 left-[-40px] bg-gray-800 text-white text-sm rounded-lg p-1 shadow-lg z-10">
              Shift Or Alt
            </div>
          )}
        </div>
      </div>
      <hr className="text-xl" />
      <div className="flex flex-wrap justify-center gap-2 w-full">
        {renderTextAreas()}
        {isModalOpen && (
          <ProxiesModal
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            proxyDownProfiles={combinedProfiles}
          />
        )}

        {modalLogs && (
          <LogsModal
            isOpen={modalLogs}
            onClose={() => setModalogs(false)}
            logs={result?.othersLogs}
            profiles={result?.othersProfiles} // Ensure profiles are passed
          />
        )}
      </div>
    </div>
  );
}
