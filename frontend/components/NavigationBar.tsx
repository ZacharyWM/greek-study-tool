import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { fetchUserData } from "../api/requests";

export const NavigationBar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const {
    isAuthenticated,
    loginWithRedirect,
    logout,
    user,
    isLoading,
    getAccessTokenSilently,
  } = useAuth0();

  useEffect(() => {
    console.log("isAuthenticated", isAuthenticated);
    if (isAuthenticated) {
      (async () => {
        const jwt = await getAccessTokenSilently();
        const userData = await fetchUserData(jwt);
        console.log("userData", userData);
      })();
    }
  }, [isAuthenticated]);

  const userLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const userLogin = () => {
    loginWithRedirect();
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Greek text from 2 Timothy 2:15 split into two lines
  const greekTextFirstLine = "σπούδασον σεαυτὸν δόκιμον παραστῆσαι τῷ θεῷ, ἐργάτην ἀνεπαίσχυντον,";
  const greekTextSecondLine = "ὀρθοτομοῦντα τὸν λόγον τῆς ἀληθείας.";

  // Academic font style for both title and reference
  const academicFontStyle = {
    fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
    letterSpacing: "0.05em"
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="flex flex-col md:flex-row items-center">
        {/* Left section with menu and title */}
        <div className="flex items-center w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center">
            <div className="relative mr-3">
              <button
                onClick={toggleDropdown}
                className="flex items-center focus:outline-none"
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

              {isDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-96 bg-white text-gray-800 rounded-md shadow-lg py-1 z-10"
                  style={{ width: "10rem" }}
                >
                  <a
                    href="/analysis?new=true"
                    className="block px-4 py-2 hover:bg-gray-200"
                    style={{ color: "black" }}
                  >
                    Create New
                  </a>
                  <a
                    href="/analyses"
                    className="block px-4 py-2 hover:bg-gray-200"
                    style={{ color: "black" }}
                  >
                    Your Analyses
                  </a>
                </div>
              )}
            </div>
            <div 
              className="text-lg font-bold"
              style={academicFontStyle}
            >
              Greek Syntax Lab
            </div>
          </div>
          
          {/* Mobile login button */}
          <div className="md:hidden">
            {isAuthenticated ? (
              <button
                onClick={userLogout}
                className="bg-red-500 px-3 py-1 rounded text-sm"
              >
                Logout
              </button>
            ) : (
              <button onClick={userLogin} className="bg-blue-500 px-3 py-1 rounded text-sm">
                Login
              </button>
            )}
          </div>
        </div>
        
        {/* Center Greek Text - with two lines */}
        <div 
          className="my-2 md:my-0 mx-auto text-center px-4 flex-1 max-w-2xl"
        >
          <div 
            className="text-xs text-gray-300 tracking-wider mb-1"
            style={{ 
              ...academicFontStyle,
              fontVariantCaps: "small-caps"
            }}
          >
            2 Timothy 2:15
          </div>
          <div 
            className="text-sm md:text-base"
            style={{ 
              fontFamily: "SBLBibLit, serif",
              lineHeight: "1.5"
            }}
          >
            <div>{greekTextFirstLine}</div>
            <div>{greekTextSecondLine}</div>
          </div>
        </div>
        
        {/* Right section with user auth - desktop only */}
        <div className="hidden md:flex items-center">
          {isAuthenticated ? (
            <>
              <span className="mr-4">Hello, {user?.given_name}</span>
              <button
                onClick={userLogout}
                className="bg-red-500 px-4 py-2 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <button onClick={userLogin} className="bg-blue-500 px-4 py-2 rounded">
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};