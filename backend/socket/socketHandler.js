import { Server } from "socket.io";
import { clientOrigins } from "../config/cors.js";

const onlineUsers = {};

const getOnlineUserIds = () => Object.keys(onlineUsers);

export const emitToUser = (userId, eventName, payload) => {
  const socketId = onlineUsers[String(userId)];

  if (socketId && global.io) {
    global.io.to(socketId).emit(eventName, payload);
  }
};

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: clientOrigins,
      methods: ["GET", "POST", "PATCH"],
      credentials: true,
    },
  });

  global.io = io;

  io.on("connection", (socket) => {
    const userId = socket.handshake.auth?.userId;

    if (!userId) {
      socket.disconnect(true);
      return;
    }

    onlineUsers[String(userId)] = socket.id;
    io.emit("getOnlineUsers", getOnlineUserIds());

    socket.on("sendMessage", ({ receiverId, message }) => {
      if (!receiverId || !message?.id) {
        return;
      }

      emitToUser(receiverId, "newMessage", message);
    });

    socket.on("typing", ({ receiverId }) => {
      if (!receiverId) {
        return;
      }

      emitToUser(receiverId, "userTyping", { senderId: Number(userId) });
    });

    socket.on("stopTyping", ({ receiverId }) => {
      if (!receiverId) {
        return;
      }

      emitToUser(receiverId, "userStopTyping", { senderId: Number(userId) });
    });

    socket.on("disconnect", () => {
      if (onlineUsers[String(userId)] === socket.id) {
        delete onlineUsers[String(userId)];
      }

      io.emit("getOnlineUsers", getOnlineUserIds());
    });
  });

  return io;
};

export { onlineUsers };
