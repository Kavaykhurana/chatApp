import { useState } from "react";

const MessageInput = ({ onSendMessage, onTyping, disabled }) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const trimmedMessage = message.trim();

  const submitMessage = async () => {
    if (!trimmedMessage || sending) {
      return;
    }

    const nextMessage = trimmedMessage;
    setMessage("");
    setSending(true);

    try {
      const sent = await onSendMessage(nextMessage);

      if (!sent) {
        setMessage(nextMessage);
      }
    } finally {
      setSending(false);
    }
  };

  const handleChange = (event) => {
    setMessage(event.target.value);
    onTyping();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitMessage();
    }
  };

  return (
    <form
      className="message-input"
      onSubmit={(event) => {
        event.preventDefault();
        submitMessage();
      }}
    >
      <input
        type="text"
        placeholder="Write a message"
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled || sending}
      />
      <button type="submit" disabled={!trimmedMessage || disabled || sending}>
        {sending ? "Sending" : "Send"}
      </button>
    </form>
  );
};

export default MessageInput;
