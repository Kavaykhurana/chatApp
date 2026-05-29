import { useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";

const isDifferentDay = (current, previous) => {
  if (!previous) {
    return true;
  }

  const currentDate = new Date(current.created_at);
  const previousDate = new Date(previous.created_at);

  return currentDate.toDateString() !== previousDate.toDateString();
};

const ChatWindow = ({
  selectedUser,
  messages,
  loadingMessages,
  isTyping,
  onSendMessage,
  onTyping,
  onBack,
}) => {
  const { isUserOnline } = useSocket();
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!selectedUser) {
    return (
      <main className="chat-window empty-chat">
        <div className="empty-state">Select a conversation to start chatting</div>
      </main>
    );
  }

  const online = isUserOnline(selectedUser.id);

  return (
    <main className="chat-window">
      <header className="chat-header">
        <button type="button" className="back-button" onClick={onBack}>
          Back
        </button>
        <div className="avatar small">{selectedUser.name.slice(0, 1).toUpperCase()}</div>
        <div>
          <h2>{selectedUser.name}</h2>
          <p>{online ? "Online" : "Offline"}</p>
        </div>
      </header>

      <section className="messages-panel">
        {loadingMessages && <div className="spinner">Loading messages...</div>}
        {!loadingMessages &&
          messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              showDateSeparator={isDifferentDay(message, messages[index - 1])}
            />
          ))}
        {!loadingMessages && messages.length === 0 && (
          <div className="empty-thread">No messages yet. Send the first one.</div>
        )}
        {isTyping && <TypingIndicator userName={selectedUser.name} />}
        <div ref={endRef} />
      </section>

      <MessageInput
        onSendMessage={onSendMessage}
        onTyping={onTyping}
        disabled={loadingMessages}
      />
    </main>
  );
};

export default ChatWindow;
