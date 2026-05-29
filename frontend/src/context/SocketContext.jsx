import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!user || !token) {
      setOnlineUsers([]);
      return undefined;
    }

    const nextSocket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: {
        userId: user.id,
      },
    });

    nextSocket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users.map(Number));
    });

    setSocket(nextSocket);

    return () => {
      nextSocket.disconnect();
      setSocket(null);
      setOnlineUsers([]);
    };
  }, [user, token]);

  const value = useMemo(
    () => ({
      socket,
      onlineUsers,
      isUserOnline: (userId) => onlineUsers.includes(Number(userId)),
    }),
    [socket, onlineUsers],
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocket must be used inside SocketProvider");
  }

  return context;
};
