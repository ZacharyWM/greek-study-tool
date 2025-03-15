import { Auth0UserInfo } from "./types";

export const fetchUserData = async (
  jwt: string
): Promise<Auth0UserInfo | undefined> => {
  try {
    const response = await fetch("/api/user", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data as Auth0UserInfo;
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};
