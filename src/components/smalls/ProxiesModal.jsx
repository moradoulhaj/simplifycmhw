import { useEffect, useState } from "react";
import TextAreaWithCopy from "./logCheckerSmalls/TextAreaWithCopy";
import TextAreaInput from "./logCheckerSmalls/TextAreaInput";
// Adjust the import path based on your folder structure

export default function ProxiesModal({
  isModalOpen,
  setIsModalOpen,
  proxyDownProfiles,
}) {
  const [proxyInput, setProxyInput] = useState("");
  const [pairedList, setPairedList] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const profiles = proxyDownProfiles.map((line) => line.split("\t")[0]); // Extract profile numbers
  const proxies = proxyInput.split("\n"); // Proxies already include the full address with ports

  useEffect(() => {
    handleProxySubmit(profiles, proxies);
    if (profiles.length === proxies.length) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [proxyInput]);

  const handleProxySubmit = (profiles, proxies) => {
    // if (profiles.length !== proxies.length) {
    //   alert("You must provide the same number of proxies as profiles.");
    //   return;
    // }

    // Pair profiles with proxies
    const newPairedList = profiles.map(
      (profile, index) => `${profile};${proxies[index]}`
    );

    // Set the paired list to the state
    setPairedList(newPairedList);
  };

  return (
    isModalOpen && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-4xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3 text-center">
              Enter Proxies
            </h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className=" text-gray-800  transition-all duration-300"
            >
              <i className="ri-close-line text-2xl "></i>
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            <div className="w-full">
              <TextAreaInput
                id="proxyDownProfiles"
                label="Proxy Down Profiles"
                value={proxyDownProfiles
                  .map((line) => line.split("\t")[0])
                  .join("\n")}
                onChange={() => {}}
                readOnly={true}
              />
            </div>
            <div className="w-full">
              <TextAreaInput
                id="proxyInput"
                label="Enter New Proxies"
                value={proxyInput}
                onChange={(e) => setProxyInput(e.target.value)}
                isValid={isValid}
              />
            </div>
          </div>
          <div className="flex justify-center gap-4 w-full">
            {isValid && (
              <TextAreaWithCopy
                id="pairedList"
                label="Paired List"
                value={pairedList.join("\n")}
                forProxies="True"
              />
            )}
          </div>
        </div>
      </div>
    )
  );
}
