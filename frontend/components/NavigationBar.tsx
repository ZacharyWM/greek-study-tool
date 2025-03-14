import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export const NavigationBar: React.FC = () => {
  const { isAuthenticated, loginWithRedirect, logout, user, isLoading } =
    useAuth0();

  if (isLoading) {
    return (
      <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div className="text-lg font-bold">Greek Bible Study</div>
        <div className="flex items-center">
          <span>Loading...</span>
        </div>
      </nav>
    );
  }

  useEffect(() => {
    if (isAuthenticated) {
      const fetchUserData = async () => {
        try {
          const response = await fetch("/api/user", {
            method: "POST",
            credentials: "include",
          });

          const data = await response.json();
          console.log("Hello, ", data);
          // You can add additional logic to handle the user data here
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchUserData();
    }
  }, [isAuthenticated]);

  const userLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const userLogin = () => {
    // TODO - would be cool to loginWithPopup() here
    loginWithRedirect();
  };

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="text-lg font-bold">Greek Bible Study</div>
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
