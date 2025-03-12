import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export const NavigationBar: React.FC = () => {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();

  useEffect(() => {
    console.log("isAuthenticated", isAuthenticated);
  }, [isAuthenticated]);

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="text-lg font-bold">Greek Study Tool</div>
      <div>
        {isAuthenticated ? (
          <button
            onClick={() =>
              logout({ logoutParams: { returnTo: window.location.origin } })
            }
            className="bg-red-500 px-4 py-2 rounded"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => loginWithRedirect()}
            className="bg-blue-500 px-4 py-2 rounded"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};
