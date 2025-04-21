import React, { useEffect, useState, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { fetchUserData } from "../api/requests";
import { cn } from "../lib/utils";
import { Link } from "react-router-dom";

interface NavigationBarProps {
  sidebar?: boolean;
  setSidebar?: (value: boolean) => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  sidebar,
  setSidebar
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    isAuthenticated,
    loginWithRedirect,
    logout,
    user,
    isLoading,
    getAccessTokenSilently,
  } = useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      (async () => {
        const jwt = await getAccessTokenSilently();
        const userData = await fetchUserData(jwt);
      })();
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const userLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const userLogin = () => {
    loginWithRedirect();
  };

  const toggleSidebar = () => {
    if (setSidebar) {
      setSidebar(!sidebar);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Greek text from 2 Timothy 2:15
  const greekText = "σπούδασον σεαυτὸν, δόκιμον παραστῆσαι τῷ Θεῷ, ἐργάτην ἀνεπαίσχυντον, ὀρθοτομοῦντα τὸν λόγον τῆς ἀληθείας";

  return (
    <nav className="bg-[#002147] text-white py-3 px-4 sm:px-6 flex justify-between items-center shadow-md">
      <div className="flex items-center">
        <div className="relative mr-4" ref={dropdownRef}>
          <button
            onClick={toggleSidebar}
            className="flex items-center focus:outline-none hover:text-blue-200 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
        </div>
        <div className="flex flex-col">
          <div className="text-xl font-serif tracking-wide">NT Syntax Lab</div>
          <div className="text-xs text-blue-200 font-serif italic hidden sm:block">Greek New Testament Analysis Tool</div>
        </div>
      </div>
      
      {/* Center Greek Text */}
      <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 max-w-xl">
        <div className="text-center">
          <div className="greek-text text-base leading-relaxed tracking-wide text-[#F7F1E3]">
            {greekText}
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        {isAuthenticated ? (
          <div className="flex items-center">
            <span className="mr-4 hidden sm:inline text-[#F7F1E3]">
              {user?.given_name && `Hello, ${user.given_name}`}
            </span>
            <button
              onClick={userLogout}
              className={cn(
                "bg-[#9F1C1C] hover:bg-[#7F1734] px-4 py-2 rounded-md text-sm transition-colors",
                "border border-[#7F1734] shadow-sm"
              )}
            >
              Logout
            </button>
          </div>
        ) : (
          <button 
            onClick={userLogin} 
            className={cn(
              "bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm transition-colors",
              "border border-blue-700 shadow-sm"
            )}
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;