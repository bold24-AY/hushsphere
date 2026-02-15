import { useNavigate } from "react-router";

const { createContext, useState, useEffect } = require("react");

export const AccountContext = createContext();

const UserContext = ({ children }) => {
  const [user, setUser] = useState({ loggedIn: null });
  const navigate = useNavigate();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    console.log("checkSession: starting...");
    try {
      console.log("checkSession: fetching /auth/login...");
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/auth/login`, {
        credentials: "include",
      });
      console.log("checkSession: fetch complete, status:", response.status);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("checkSession: data received:", data);

      if (data.loggedIn) {
        setUser({ ...data });
        // Optional: navigate("/home") if you want auto-redirect on session check
        // But be careful not to redirect if already there.
        // For now, let's leave it to Views.js to handle the initial render?
        // Actually, Views.js shows "Loading..." until user.loggedIn is set.
        // Once set to true, it renders Routes. PrivateRoutes handles access.
        // If we want to force user to /home if they visit / login page while logged in,
        // we should do that in the Login component or here.
        // Let's keep the existing behavior of redirecting to /home on success.
        navigate("/home");
      } else {
        setUser({ loggedIn: false });
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setUser({ loggedIn: false });
    }
  };

  return (
    <AccountContext.Provider value={{ user, setUser }}>
      {children}
    </AccountContext.Provider>
  );
};

export default UserContext;
