import { useAuth } from "../context/AuthContext";

const formatTime = (dateValue) =>
  new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(dateValue));

const formatDateLabel = (dateValue) => {
  const messageDate = new Date(dateValue);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDate = (first, second) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();

  if (isSameDate(messageDate, today)) {
    return "Today";
  }

  if (isSameDate(messageDate, yesterday)) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(messageDate);
};

const MessageBubble = ({ message, showDateSeparator }) => {
  const { user } = useAuth();
  const isSent = message.sender_id === user?.id;

  return (
    <>
      {showDateSeparator && (
        <div className="date-separator">
          <span>{formatDateLabel(message.created_at)}</span>
        </div>
      )}
      <div className={`message-row ${isSent ? "sent" : "received"}`}>
        <div className="message-bubble">
          <p>{message.message}</p>
          <span className="message-time">
            {formatTime(message.created_at)}
            {isSent && <span className="read-receipt">{message.is_read ? "Read" : "Sent"}</span>}
          </span>
        </div>
      </div>
    </>
  );
};

export default MessageBubble;
