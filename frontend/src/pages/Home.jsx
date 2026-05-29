import { useEffect, useState } from "react";
import ChatWindow from "../components/ChatWindow";
import Sidebar from "../components/Sidebar";
import { useChat } from "../hooks/useChat";

const Home = ({ theme, onToggleTheme }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const { messages, loadingMessages, isTyping, sendMessage, emitTyping } =
    useChat(selectedUser);

  useEffect(() => {
    if (selectedUser) {
      setShowChatOnMobile(true);
    }
  }, [selectedUser]);

  return (
    <div className={`app-shell ${showChatOnMobile ? "mobile-chat-open" : ""}`}>
      <Sidebar
        selectedUser={selectedUser}
        onSelectUser={setSelectedUser}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />
      <ChatWindow
        selectedUser={selectedUser}
        messages={messages}
        loadingMessages={loadingMessages}
        isTyping={isTyping}
        onSendMessage={sendMessage}
        onTyping={emitTyping}
        onBack={() => setShowChatOnMobile(false)}
      />
    </div>
  );
};

export default Home;
