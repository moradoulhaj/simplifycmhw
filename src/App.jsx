import React, { useEffect, useState } from "react";
import Sidebar from "./components/smalls/SideBar";
import RemoveSessions from "./components/RemoveSessions";
import Offers from "./components/Offers";
import DelimiterSwitch from "./components/DelimterSwitch";
import AddSessionUsingTags from "./components/AddSessionsUsinTags";
import Spliter from "./components/Spliter";
import LogChecker from "./components/LogChecker";
import SpamCalculator from "./components/SpamCalculator";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Footer from "./components/smalls/Footer";
import RamadanTask from "./components/RamadanTask";
import CleanChecker from "./components/CleanChecker";
import { AlignJustify } from "lucide-react"; // Importing the menu icon
import SpliterBeta from "./components/SpliterBeta";
import UpdateTask from "./components/UpdateTask";
import Login from "./components/Login";
import ProtectedRoute from "./scripts/ProtectedRoute ";
import AdminDashboard from "./components/AdminDashboard";
import Cookies from "js-cookie";
import AddSessionUsingTagsBeta from "./components/AddSessionsUsinTagsBeta";
import LogCheckerBeta from "./components/LogCheckerBeta";
import LogCheckerNew from "./components/LogCheckerNew";
import LogAnalyse from "./components/Desktop/LogAnalyse";
import Loading from "./components/Desktop/Loading";
import CheckDouble from "./components/Desktop/EmailDuplicateChecker";
import EmailDuplicateChecker from "./components/Desktop/EmailDuplicateChecker";
import TwoListsComparetor from "./components/Desktop/TwoListsComparetor";
import SheduleGenerator from "./components/SheduleGenerator";
import SpamCalculatorBeta from "./components/SpamCalculatorBeta";
import LogAnalyseV2 from "./components/Desktop/LogAnalyseV2";
import OfferRanges from "./components/OfferRanges";
import ProxiesHelper from "./components/useless/ProxiesHelper";
import ProxiesHelperNew from "./components/useless/ProxiesHelperNew";
import Users from "./components/DashboardComponents/Users";
import ProxiesListing from "./components/ProxiesListing";
import CsvGenerator from "./components/ProxieDuplication";
import ProxieDuplication from "./components/ProxieDuplication";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="flex min-h-screen bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50">
        {/* Sidebar */}

        <Sidebar
          isOpen={sidebarOpen}
          toggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main Content */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
      
            <nav className="bg-blue-600 text-white p-3 flex items-center shadow-md justify-between ">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2"
              >
                <AlignJustify size={28} />
              </button>
              <h1 className="mr-3 text-lg font-semibold">
               
              CMHW - SIMPLIFY V1.9
              </h1>
            </nav>
     

          {/* Page Content */}
          <div className="flex-grow p-4">
            <Routes>
              {/* Public route */}
              <Route path="/login" element={<Login />} />
              <Route path="/proxiesHelperNew" element={<ProxiesHelperNew />} />

              {/* Protected routes */}
              <Route path="/users" element={<Users />} />
              <Route path="/csvGenerator" element={<CsvGenerator />} />
              <Route path="/duplicateProxies" element={<ProxieDuplication />} />


              
                <Route path="/readAndShow" element={<Offers />} />
                <Route path="/removeTags" element={<RemoveSessions />} />
                <Route path="/addUsingTags" element={<AddSessionUsingTags />} />
                <Route path="/delimiterSwitch" element={<DelimiterSwitch />} />
                <Route path="/spliter" element={<Spliter />} />
                <Route path="/logChecker" element={<LogChecker />} />
                <Route path="/logCheckerbeta" element={<LogCheckerBeta />} />
                <Route path="/logCheckerNew" element={<LogCheckerNew />} />
                <Route path="/spamCalculator" element={<SpamCalculator />} />
                <Route path="/ramadanTask" element={<RamadanTask />} />
                <Route path="/cleanChecker" element={<CleanChecker />} />
                <Route path="/spliterBeta" element={<SpliterBeta />} />
                <Route path="/updateTask" element={<UpdateTask />} />
                <Route path="/offerRanges" element={<OfferRanges />} />
                <Route path="/proxiesHelper" element={<ProxiesHelper />} />
                <Route path="/proxiesListing" element={<ProxiesListing />} />



                <Route
                  path="/sheduleGenerator"
                  element={<SheduleGenerator />}
                />
                <Route
                  path="/spamCalculatorBeta"
                  element={<SpamCalculatorBeta />}
                />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route
                  path="/addSessionBeta"
                  element={<AddSessionUsingTagsBeta />}
                />
                {/* Desktop routes */}
                
                {/* <Route path="/logAnalyser" element={<LogAnalyse />} /> */}
                <Route path="/logAnalyser" element={<LogAnalyseV2 />} />
                <Route
                  path="/emailDuplicateChecker"
                  element={<EmailDuplicateChecker />}
                />
                <Route
                  path="/compareTwoLists"
                  element={<TwoListsComparetor />}
                />
                <Route path="/notExistingProfiles" element={<Loading />} />
                <Route path="/emailsOfProfiles" element={<Loading />} />
                <Route path="/profilesOfEmails" element={<Loading />} />

                {/* Catch all protected route */}
                <Route path="*" element={<LogChecker />} />
            </Routes>
          </div>

          {/* Footer - Stays at bottom */}
          <Footer />
        </div>
      </div>
    </Router>
  );
}
