import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown, ChevronUp, LogOut } from "lucide-react";

export default function Sidebar({ isOpen, toggle }) {
  const [deprecatedOpen, setDeprecatedOpen] = useState({});
  const [categoryOpen, setCategoryOpen] = useState({
    tool: true,
    desktop: true,
  });

  const links = [
    // Tool links
    {
      path: "/readAndShow",
      label: "Read and Show",
      category: "tool",
      status: "deprecated",
    },
    {
      path: "/removeTags",
      label: "Remove Sessions",
      category: "tool",
      status: "deprecated",
    },
    {
      path: "/addUsingTags",
      label: "Add Session",
      category: "tool",
      status: "deprecated",
    },
    {
      path: "/delimiterSwitch",
      label: "Delimiter Switch",
      category: "tool",
      status: "deprecated",
    },
    {
      path: "/spliter",
      label: "Drive Spliter",
      category: "tool",
      status: "deprecated",
    },
    {
      path: "/logChecker",
      label: "Log Checker",
      category: "tool",
      status: "deprecated",
    },
    {
      path: "/logCheckerBeta",
      label: "Log Checker - TEST",
      category: "tool",
      status: "deprecated",
    },
    {
      path: "/logCheckerNew",
      label: "Log Checker - NEW",
      category: "tool",
      status: "deprecated",
    },
    {
      path: "/spamCalculator",
      label: "Spam Calculator",
      category: "tool",
      status: "deprecated",
    },
    {
      path: "/ramadanTask",
      label: "Next Day Login",
      category: "tool",
      status: "deprecated",
    },
    {
      path: "/addSessionBeta",
      label: "Add Session Beta",
      category: "tool",
      status: "deprecated",
    },
    {
      path: "/spliterBeta",
      label: "Spliter Beta",
      category: "tool",
      status: "deprecated",
    },
    {
      path: "/updateTask",
      label: "Remove TO Tasks",
      category: "tool",
      status: "deprecated",
    },
    {
      path: "/sheduleGenerator",
      label: "Schedule Generator",
      category: "tool",
      status: "deprecated",
    },
    {
      path: "/spamCalculatorBeta",
      label: "Spam Calculator -Noureddin",
      category: "tool",
      status: "deprecated",
    },
    {
      path: "/offerRanges",
      label: "Formatting Ranges",
      category: "tool",
      status: "deprecated",
    },
    {
      path: "/proxiesHelper",
      label: "Proxies Helper v2",
      category: "tool",
      status: "deprecated",
    },
    {
      path: "/proxiesHelperNew",
      label: "Proxies Helper New",
      category: "tool",
      status: "active",
    }, {
      path: "/duplicateProxies",
      label: "CMH5 Duplicate Proxies",
      category: "tool",
      status: "active",
    }, {
      path: "/emptyProfiles",
      label: "Empty Profiles",
      category: "tool",
      status: "active",
    },

    // Desktop links
    {
      path: "/logAnalyser",
      label: "Log Analyser",
      category: "desktop",
      status: "active",
    },
    {
      path: "/proxiesListing",
      label: "Khadija Tool",
      category: "desktop",
      status: "active",
    },
    {
      path: "/emailDuplicateChecker",
      label: "Email Duplicate Checker",
      category: "desktop",
      status: "deprecated",
    },
    {
      path: "/compareTwoLists",
      label: "Compare Two Lists",
      category: "desktop",
      status: "deprecated",
    },
    {
      path: "/notExistingProfiles",
      label: "Not Existing Profiles",
      category: "desktop",
      status: "deprecated",
    },
    {
      path: "/emailsOfProfiles",
      label: "Emails of Profiles",
      category: "desktop",
      status: "deprecated",
    },
    {
      path: "/profilesOfEmails",
      label: "Profiles of Emails",
      category: "desktop",
      status: "deprecated",
    }
 
  ];
  
  const categories = ["tool", "desktop"];

  const toggleCategory = (category) => {
    setCategoryOpen((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const toggleDropdown = (category) => {
    setDeprecatedOpen((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const renderLinks = (category, status) =>
    links
      .filter((link) => link.category === category && link.status === status)
      .map((link) => (
        <li key={link.path}>
          <NavLink
            to={link.path}
            className={({ isActive }) =>
              `block text-sm px-4 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-white text-blue-600 font-semibold shadow-sm"
                  : "text-blue-100 hover:bg-blue-700 hover:text-white"
              }`
            }
            onClick={toggle}
          >
            {link.label}
          </NavLink>
        </li>
      ));

  return (
    <div
      className={`fixed top-0 left-0 h-screen w-70 bg-gradient-to-b from-blue-600 to-blue-800 shadow-xl p-2 overflow-y-auto transition-all duration-300 z-50 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="sticky top-0 bg-blue-600 pt-2  px-5">
        <h2 className="text-white text-2xl font-bold mb-2 text-center">
          Admin Dashboard
        </h2>

        {/* <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.reload();
          }}
          className="flex items-center justify-center w-full gap-2 text-sm text-white px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 transition-all mb-6"
        >
          <LogOut size={16} />
          Log Out
        </button> */}
      </div>

      <div className="space-y-6 mt-2">
        {categories.map((category) => {
          const hasDeprecated = links.some(
            (link) => link.category === category && link.status === "deprecated"
          );

          return (
            <div key={category} className="bg-blue-700/20 rounded-xl p-2">
              <button
                onClick={() => toggleCategory(category)}
                className="flex items-center justify-between w-full text-base font-semibold text-white capitalize px-3 py-2.5 rounded-lg hover:bg-blue-700/50 transition-all"
              >
                <span className="flex items-center gap-2">
                  <span className="capitalize">{category}</span>
                  <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                    {
                      links.filter(
                        (l) => l.category === category && l.status === "active"
                      ).length
                    }
                  </span>
                </span>
                {categoryOpen[category] ? (
                  <ChevronUp size={18} className="text-blue-200" />
                ) : (
                  <ChevronDown size={18} className="text-blue-200" />
                )}
              </button>

              {categoryOpen[category] && (
                <>
                  <ul className="space-y-1 mt-2 pl-1">
                    {renderLinks(category, "active")}
                  </ul>

                  {hasDeprecated && (
                    <>
                      <button
                        onClick={() => toggleDropdown(category)}
                        className="flex items-center justify-between w-full text-xs text-blue-200 px-3 py-2 rounded-lg hover:bg-blue-700/30 transition-all mt-2"
                      >
                        <span className="flex items-center gap-2">
                          <span>Deprecated Tools</span>
                          <span className="text-xs bg-blue-600/70 text-blue-100 px-2 py-0.5 rounded-full">
                            {
                              links.filter(
                                (l) =>
                                  l.category === category &&
                                  l.status === "deprecated"
                              ).length
                            }
                          </span>
                        </span>
                        {deprecatedOpen[category] ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>

                      {deprecatedOpen[category] && (
                        <ul className="space-y-1 ml-4 border-l-2 border-blue-500/30 pl-3 py-1">
                          {renderLinks(category, "deprecated")}
                        </ul>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
