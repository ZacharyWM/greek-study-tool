import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { fetchUserData } from "../api/requests";

interface NavigationBarProps {
  sidebar: boolean;
  setSidebar: (value: boolean) => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  sidebar,
  setSidebar,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const {
    isAuthenticated,
    loginWithRedirect,
    logout,
    user,
    isLoading,
    getAccessTokenSilently,
  } = useAuth0();

  // if (isLoading) {
  //   return (
  //     <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
  //       <div className="text-lg font-bold">Greek Bible Study</div>
  //       <div className="flex items-center">
  //         <span>Loading...</span>
  //       </div>
  //     </nav>
  //   );
  // }

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
    // TODO - would be cool to loginWithPopup() here
    loginWithRedirect();
  };

  // TODO - probably remove dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleSidebar = () => {
    setSidebar(!sidebar);
  };

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="flex items-center">
        <div className="relative mr-3">
          <button
            onClick={toggleSidebar}
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
        <div className="text-lg font-bold">Greek Bible Study</div>
      </div>
      <div className="flex items-center">
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
    </nav>
  );
};
