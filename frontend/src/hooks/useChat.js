import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useToast } from "../context/ToastContext";

export const useChat = (selectedUser) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
      setIsTyping(false);
      return undefined;
    }

    let isMounted = true;

    const loadConversation = async () => {
      setLoadingMessages(true);

      try {
        const { data } = await api.get(`/messages/${selectedUser.id}`);

        if (isMounted) {
          setMessages(data.messages);
        }

        await api.patch(`/messages/read/${selectedUser.id}`);
      } catch (error) {
        if (isMounted) {
          showToast(error.response?.data?.message || "Failed to load messages", "error");
        }
      } finally {
        if (isMounted) {
          setLoadingMessages(false);
        }
      }
    };

    loadConversation();

    return () => {
      isMounted = false;
    };
  }, [selectedUser, showToast]);

  useEffect(() => {
    if (!socket || !selectedUser || !user) {
      return undefined;
    }

    const handleNewMessage = async (message) => {
      const belongsToOpenConversation =
        (message.sender_id === selectedUser.id && message.receiver_id === user.id) ||
        (message.sender_id === user.id && message.receiver_id === selectedUser.id);

      if (!belongsToOpenConversation) {
        return;
      }

      setMessages((current) => {
        if (current.some((existingMessage) => existingMessage.id === message.id)) {
          return current;
        }

        return [...current, message];
      });

      if (message.sender_id === selectedUser.id) {
        try {
          await api.patch(`/messages/read/${selectedUser.id}`);
        } catch {
          showToast("Failed to update read receipts", "error");
        }
      }
    };

    const handleTyping = ({ senderId }) => {
      if (Number(senderId) === Number(selectedUser.id)) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = ({ senderId }) => {
      if (Number(senderId) === Number(selectedUser.id)) {
        setIsTyping(false);
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("userTyping", handleTyping);
    socket.on("userStopTyping", handleStopTyping);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("userTyping", handleTyping);
      socket.off("userStopTyping", handleStopTyping);
    };
  }, [socket, selectedUser, user, showToast]);

  const sendMessage = async (messageText) => {
    if (!selectedUser) {
      return false;
    }

    try {
      const { data } = await api.post(`/messages/send/${selectedUser.id}`, {
        message: messageText,
      });

      setMessages((current) => [...current, data.message]);
      socket?.emit("stopTyping", { receiverId: selectedUser.id });
      setIsTyping(false);
      return true;
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to send message", "error");
      return false;
    }
  };

  const emitTyping = () => {
    if (!socket || !selectedUser) {
      return;
    }

    socket.emit("typing", { receiverId: selectedUser.id });

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      socket.emit("stopTyping", { receiverId: selectedUser.id });
    }, 1500);
  };

  return {
    messages,
    loadingMessages,
    isTyping,
    sendMessage,
    emitTyping,
  };
};
