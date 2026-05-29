import { useSocket } from "../context/SocketContext";

const getInitials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const UserListItem = ({ user, isActive, onSelect }) => {
  const { isUserOnline } = useSocket();
  const online = isUserOnline(user.id);

  return (
    <button
      type="button"
      className={`user-list-item ${isActive ? "active" : ""}`}
      onClick={() => onSelect(user)}
    >
      <span className="avatar-wrap">
        <span className="avatar">{getInitials(user.name)}</span>
        <span className={`status-dot ${online ? "online" : "offline"}`} />
      </span>
      <span className="contact-meta">
        <span className="contact-name">{user.name}</span>
        <span className="contact-status">{online ? "Online" : "Offline"}</span>
      </span>
      {user.unread_count > 0 && <span className="unread-count">{user.unread_count}</span>}
    </button>
  );
};

export default UserListItem;
